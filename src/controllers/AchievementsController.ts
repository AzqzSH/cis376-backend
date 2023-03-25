import { Controller, Get, Params, Query, Req, Res } from '@decorators/express';
import { Response } from 'express';
import { SafeThrowAll } from '../lib/decorators/SafeThrow';
import { AUTH_MIDDLEWARE } from '../middleware/AuthMiddleware';
import { Request } from '../types/Request';
import { Injectable } from '@decorators/di';
import { AchievementService } from '../services/AchievementService';

@Controller('/achievements')
@Injectable()
@SafeThrowAll
export class AchievementsController {
	constructor(private readonly achievemntService: AchievementService) {}

	@Get('/')
	async getAchievements(
		@Req() req: Request,
		@Res() res: Response,
		@Query('limit') limit: number = 10,
		@Query('offset') offset: number = 0
	) {
		// const user = req.user!;

		const achievements = await this.achievemntService.getAchievementForUser(
			'',
			{
				limit,
				offset,
			}
		);

		res.send(achievements);
	}

	@Get('/:id')
	async getAchievement(
		@Req() req: Request,
		@Res() res: Response,
		@Params('id') id: string
	) {
		// const user = req.user!;

		const achievement = await this.achievemntService.getAchievementById(
			id,
			''
		);

		res.send(achievement);
	}

	@Get('/:id/unlock')
	async unlockAchievement(
		@Req() req: Request,
		@Res() res: Response,
		@Params('id') id: string
	) {
		const user = req.user!;

		await this.achievemntService.unlockAchievement(id, user.id);

		res.send({
			message: 'Achievement unlocked',
		});
	}
}
