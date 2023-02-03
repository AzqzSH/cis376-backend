import { Container, Inject, Injectable } from '@decorators/di';
import { Middleware } from '@decorators/express';
import { NextFunction, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { Request } from '../types/Request';

@Injectable()
export class AuthMiddleware implements Middleware {
	private authService: AuthService;

	constructor() {
		this.authService = new AuthService();
	}

	async use(req: Request, res: Response, next: NextFunction) {
		const bearer = req.headers.authorization;

		if (!bearer) {
			res.status(401).send('Unauthorized');

			return;
		}

		const token = bearer.split(' ')[1];

		const user = await this.authService.validateToken(token);

		if (!user) {
			res.status(401).send('Unauthorized');

			return;
		}

		const { hashedPassword, ...rest } = user;

		req.user = rest;

		next();
	}
}
