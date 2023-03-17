import { Response } from 'express';

export type ErrorType = string | object;
export type SerializedError = {
	[key: string]: string | number | object;
};

export abstract class BaseError {
	status: number;
	message: ErrorType;
	name: string = 'Base Error';

	constructor(message: ErrorType = 'Something went wrong') {
		this.name = 'ServerError';
		this.status = 500;
		this.message = message;
	}

	serialize(): SerializedError {
		return {
			status: this.status,
			message: this.message,
			name: this.name,
		};
	}

	toJSON() {
		return this.serialize();
	}

	safeThrow(res: Response) {
		res.status(this.status).json(this);
	}
}
