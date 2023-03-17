import prisma from '../client';
import { Controller, Get, Params, Query, Res } from '@decorators/express';
import { Response } from 'express';
import { SafeThrowAll } from '../lib/decorators/SafeThrow';
import { NotFoundError } from '../exceptions/NotFoundError';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

@Controller('/locations')
@SafeThrowAll
export class LocationsController {
	@Get('/')
	async getLocations(
		@Res() res: Response,
		@Query('limit') limit: number = 10,
		@Query('offset') offset: number = 0
	) {
		const locations = await prisma.location.findMany({
			take: limit,
			skip: offset,
		});

		res.send(locations);
	}

	@Get('/:id')
	async getLocation(@Res() res: Response, @Params('id') id: string) {
		const location = await prisma.location.findUnique({
			where: {
				id,
			},
		});

		if (!location) {
			throw new NotFoundError();
		}

		res.send(location);
	}
}
