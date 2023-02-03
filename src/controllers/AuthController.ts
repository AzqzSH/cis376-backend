import { Injectable } from '@decorators/di';
import { Controller, Get, Post, Req, Res } from '@decorators/express';
import { Response } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { AuthService } from '../services/AuthService';
import { Request } from '../types/Request';

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

	@Get('/me', [AuthMiddleware])
	async me(@Req() req: Request, @Res() res: Response) {
		res.send({
			id: req.user!.id,
			email: req.user!.email,
		});
	}
}
