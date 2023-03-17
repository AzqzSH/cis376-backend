import { BaseError } from './BaseError';

export class NotFoundError extends BaseError {
	constructor(message: string = 'Not Found') {
		super(message);

		this.status = 404;
		this.name = 'NotFoundError';
	}
}
