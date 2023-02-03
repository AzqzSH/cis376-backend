import prisma from '../client';
import { Controller, Get, Params, Res } from '@decorators/express';
import { Response } from 'express';

@Controller('/locations')
export class LocationsController {
	@Get('/')
	async getLocations(@Res() res: Response) {
		const locations = await prisma.location.findMany();

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
			throw new Error('Not Found');
		}

		res.send(location);
	}
}
