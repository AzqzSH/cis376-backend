import { Injectable } from '@decorators/di';
import prisma from '../client';
import { BadRequest } from '../exceptions/BadRequestError';
import { NotFoundError } from '../exceptions/NotFoundError';

@Injectable()
export class LocationService {
	async getLocationsForUser(
		userId: string,
		options: { limit?: number; offset?: number } = {}
	) {
		const locations = await prisma.location.findMany({
			take: options.limit,
			skip: options.offset,
			select: {
				id: true,
				name: true,
				latitude: true,
				longitude: true,
				page: true,
				image: true,
				_count: {
					select: {
						users: true,
					},
				},
			},
		});

		return locations.map(({ _count, ...location }) => ({
			...location,
			isUnlocked: _count.users > 0,
		}));
	}

	async getLocationById(id: string, userId?: string) {
		const location = await prisma.location.findUnique({
			where: {
				id,
			},
			select: {
				id: true,
				name: true,
				latitude: true,
				longitude: true,
				page: true,
				image: true,
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

		if (!location) {
			throw new NotFoundError();
		}

		const { users, ...loc } = location;

		return {
			...loc,
			isUnlocked: users.length > 0,
		};
	}

	async unlockLocation(id: string, userId: string) {
		try {
			const unlocked = await prisma.unlockedLocation.findFirst({
				where: {
					locationId: id,
					userId,
				},
			});

			if (!!unlocked) {
				throw new BadRequest('Location already unlocked');
			}

			await prisma.unlockedLocation.create({
				data: {
					locationId: id,
					userId,
				},
			});
		} catch (e) {
			throw new BadRequest('Location already unlocked');
		}
	}
}
