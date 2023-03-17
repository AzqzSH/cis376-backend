import { Injectable, InjectionToken } from '@decorators/di';
import { Middleware } from '@decorators/express';
import { NextFunction, Response } from 'express';
import { UnauthorizedError } from '../exceptions/UnauthorizedError';
import { AuthService } from '../services/AuthService';
import { Request } from '../types/Request';

@Injectable()
export class AuthMiddleware implements Middleware {
	constructor(private readonly authService: AuthService) {}

	async use(req: Request, res: Response, next: NextFunction) {
		const bearer = req.headers.authorization;

		if (!bearer) {
			return new UnauthorizedError().safeThrow(res);
		}

		const token = bearer.split(' ')[1];

		const user = await this.authService.validateToken(token);

		if (!user) {
			return new UnauthorizedError().safeThrow(res);
		}

		const { hashedPassword, ...rest } = user;

		req.user = rest;

		next();
	}
}

export const AUTH_MIDDLEWARE = new InjectionToken(AuthMiddleware.name) as any;
