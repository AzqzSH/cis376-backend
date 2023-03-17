import { Request, Response } from 'express';
import { BaseError } from '../../exceptions/BaseError';

const SafeThrow = (idx: number) => {
	return (target: any, propertyKey: string, descriptor: any) => {
		const fun = descriptor.value;

		descriptor.value = async function () {
			try {
				await fun?.apply(this, arguments as any);
			} catch (err: any) {
				const res = arguments[idx] as Response;

				if (err instanceof BaseError) {
					return res.status(err.status).json(err);
				} else {
					res.status(500).send(err.message);
				}
			}
		};

		return descriptor;
	};
};

export function SafeThrowAll(target: Function) {
	let responseParamMetadata: {
		method: string;
		index: number;
	}[] = [];

	if ('__express_meta__' in target.prototype) {
		const meta = target.prototype.__express_meta__;

		const methodParams = meta.params as {
			[x: string]: { index: number; type: number }[];
		};

		for (const key in methodParams) {
			const methodParam = methodParams[key];

			if (methodParam.find((p) => p.type === 1)) {
				responseParamMetadata.push({
					method: key,
					index: methodParam.find((p) => p.type === 1)?.index!!,
				});
			}
		}
	}

	const properties = Object.getOwnPropertyDescriptors(target.prototype);

	for (const key in properties) {
		const params = responseParamMetadata.find((p) => p.method === key);

		if (!params) continue;

		let descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

		if (
			descriptor &&
			descriptor.value &&
			typeof descriptor.value === 'function'
		) {
			if (descriptor.value == target.prototype.constructor) continue;

			const safeThrow = SafeThrow(params.index);

			descriptor = safeThrow(target.prototype, key, descriptor) as any;

			Object.defineProperty(target.prototype, key, descriptor as any);
		}
	}
}
