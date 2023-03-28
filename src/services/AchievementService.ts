import { Injectable } from '@decorators/di';
import prisma from '../client';
import { BadRequest } from '../exceptions/BadRequestError';
import { NotFoundError } from '../exceptions/NotFoundError';

@Injectable()
export class AchievementService {
	async getAchievementForUser(
		userId: string,
		options: { limit?: number; offset?: number } = {}
	) {
		const achievements = await prisma.achievement.findMany({
			take: options.limit,
			skip: options.offset,
			select: {
				id: true,
				name: true,
				description: true,
				icon: true,
				points: true,
				users: {
					select: {
						id: true,
					},
					where: {
						id: userId,
					},
				},
			},
		});

		return achievements.map(({ users, ...achievement }) => ({
			...achievement,
			isUnlocked: users.length > 0,
		}));
	}

	async getAchievementById(id: string, userId?: string) {
		const achievemnt = await prisma.achievement.findUnique({
			where: {
				id,
			},
			select: {
				id: true,
				name: true,
				description: true,
				icon: true,
				points: true,
				users: {
					select: {
						id: true,
					},
					where: {
						id: userId,
					},
				},
			},
		});

		if (!achievemnt) {
			throw new NotFoundError();
		}

		const { users, ...a } = achievemnt;

		return {
			...a,
			isUnlocked: users.length > 0,
		};
	}

	async unlockAchievement(id: string, userId: string) {
		try {
			await prisma.unlockedAchievement.create({
				data: {
					achievementId: id,
					userId,
				},
			});
		} catch (e) {
			throw new BadRequest('Achievement already unlocked');
		}
	}
}
