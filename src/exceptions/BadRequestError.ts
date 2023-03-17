import { BaseError, ErrorType } from './BaseError';

export class BadRequest extends BaseError {
	constructor(message: ErrorType) {
		super(message);

		this.name = 'BadRequest';
		this.status = 400;
	}
}
