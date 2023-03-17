import { BaseError, ErrorType, SerializedError } from './BaseError';

export class ValidationError extends BaseError {
	constructor(message: ErrorType) {
		super(message);

		this.name = 'ValidationError';
		this.status = 400;
	}

	serialize(): SerializedError {
		return {
			name: this.name,
			fields: this.message,
			status: this.status,
		};
	}
}
