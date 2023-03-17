import { BaseError } from './BaseError';

export class UnauthorizedError extends BaseError {
	constructor(message: string = 'Unauthorized') {
		super(message);

		this.status = 401;
		this.name = 'UnauthorizedError';
	}
}
