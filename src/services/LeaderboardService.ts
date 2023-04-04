import { Injectable } from '@decorators/di';
import { User } from '@prisma/client';
import prisma from '../client';

interface UserWithScore extends User {
	score: number;
}

interface Leaderboard {
	users: UserWithScore[];
	hasMore: boolean;
}

@Injectable()
export class LeaderboardService {
	async getLeaderboard(limit: number = 10, offset: number = 0) {
		// Get users with their scores by joining the user and unlocked locations & unlocked achievements tables
		let users = await prisma.$queryRaw<UserWithScore[]>`
            SELECT id, email, (COALESCE(locationScore * 10, 0) + COALESCE(achievementPoints, 0)) as score 
            FROM User u
            LEFT JOIN (
                SELECT userId, COUNT(*) AS locationScore FROM UnlockedLocation
                GROUP BY userId
            ) AS loc ON u.id = loc.userId
            LEFT JOIN (
                SELECT userId, SUM(points) as achievementPoints FROM UnlockedAchievement 
                LEFT JOIN Achievement ON UnlockedAchievement.achievementId = Achievement.id
                GROUP BY userId
            ) AS ach ON u.id = ach.userId
            GROUP BY id, email
            ORDER BY score DESC
            LIMIT ${limit + 1} 
            OFFSET ${offset}
        `;

		// Check if there are more users to fetch
		const hasMore = users.length > limit;

		// Remove the last user
		if (hasMore) {
			users.pop();
			users.pop();
		}

		return {
			entries: this.convertBigIntsToNumbers(users),
			hasMore,
		};
	}

	convertBigIntsToNumbers(users: UserWithScore[]) {
		return JSON.parse(
			JSON.stringify(users, (_, value) => {
				if (typeof value === 'bigint') {
					return parseInt(String(value));
				}

				return value;
			})
		);
	}
}
