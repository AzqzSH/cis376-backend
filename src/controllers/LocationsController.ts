import { Controller, Get, Params, Query, Req, Res } from '@decorators/express';
import { Response } from 'express';
import { SafeThrowAll } from '../lib/decorators/SafeThrow';
import { AUTH_MIDDLEWARE } from '../middleware/AuthMiddleware';
import { Request } from '../types/Request';
import { LocationService } from '../services/LocationService';
import { Injectable } from '@decorators/di';

@Controller('/locations', [AUTH_MIDDLEWARE])
@Injectable()
@SafeThrowAll
export class LocationsController {
	constructor(private readonly locationService: LocationService) {}

	@Get('/')
	async getLocations(
		@Req() req: Request,
		@Res() res: Response,
		@Query('limit') limit: number = 10,
		@Query('offset') offset: number = 0
	) {
		const user = req.user!;

		const locations = await this.locationService.getLocationsForUser(
			user.id,
			{
				limit,
				offset,
			}
		);

		res.send(locations);
	}

	@Get('/:id')
	async getLocation(
		@Req() req: Request,
		@Res() res: Response,
		@Params('id') id: string
	) {
		const user = req.user!;

		const location = await this.locationService.getLocationById(
			id,
			user.id
		);

		res.send(location);
	}

	@Get('/:id/unlock')
	async unlockLocation(
		@Req() req: Request,
		@Res() res: Response,
		@Params('id') id: string
	) {
		const user = req.user!;

		await this.locationService.unlockLocation(id, user.id);

		res.send({
			message: 'Location unlocked',
		});
	}
}
