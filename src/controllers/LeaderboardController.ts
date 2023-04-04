import { Injectable } from '@decorators/di';
import { Controller, Get, Query, Res } from '@decorators/express';
import { Response } from 'express';
import { SafeThrowAll } from '../lib/decorators/SafeThrow';
import { AUTH_MIDDLEWARE } from '../middleware/AuthMiddleware';
import { LeaderboardService } from '../services/LeaderboardService';

@Injectable()
@Controller('/leaderboard', [AUTH_MIDDLEWARE])
@SafeThrowAll
export class LeaderboardController {
	constructor(private readonly leaderboardService: LeaderboardService) {}

	@Get('/')
	async getLeaderboard(
		@Res() res: Response,
		@Query('limit') limit: number = 10,
		@Query('offset') offset: number = 0
	) {
		const leaderboard = await this.leaderboardService.getLeaderboard(
			limit,
			offset
		);

		res.send(leaderboard);
	}
}
