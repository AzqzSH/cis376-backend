import 'reflect-metadata';

import { attachControllers } from '@decorators/express';
import express from 'express';
import { AuthController, LocationsController } from './controllers';

import prisma from './client';
import { json } from 'body-parser';

const startServer = async () => {
	const app = express();

	app.use(json());

	const port = process.env.PORT || 8000;

	attachControllers(app, [LocationsController, AuthController]);

	await prisma.$connect();

	app.listen(port, () => {
		console.log(
			`Server listening on port ${port} | http://localhost:${port}`
		);
	});
};

startServer()
	.catch((err) => {
		console.error(err);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
