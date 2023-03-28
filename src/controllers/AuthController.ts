import { Injectable } from '@decorators/di';
import { Controller, Get, Post, Query, Req, Res } from '@decorators/express';
import { Response } from 'express';
import { SafeThrowAll } from '../lib/decorators/SafeThrow';
import { AUTH_MIDDLEWARE } from '../middleware/AuthMiddleware';
import { AuthService } from '../services/AuthService';
import { Request } from '../types/Request';

@SafeThrowAll
@Injectable()
@Controller('/auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('/login')
	async login(@Req() req: Request, @Res() res: Response) {
		const user = await this.authService.validateCredentials(req.body);

		const tokens = await this.authService.createTokens(user);

		res.send(tokens);
	}

	@Post('/register')
	async register(@Req() req: Request, @Res() res: Response) {
		const user = await this.authService.createUser(req.body);

		res.send(user.id);
	}

	@Get('/refresh-token')
	async refreshToken(
		@Req() req: Request,
		@Res() res: Response,
		@Query('refresh') refresh: string = ''
	) {
		const newTokens = await this.authService.refreshToken(refresh);

		res.send(newTokens);
	}

	@Get('/me', [AUTH_MIDDLEWARE])
	async me(@Req() req: Request, @Res() res: Response) {
		res.send({
			id: req.user!.id,
			email: req.user!.email,
		});
	}
}
