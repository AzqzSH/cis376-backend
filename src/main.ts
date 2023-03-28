import 'reflect-metadata';

import { attachControllers } from '@decorators/express';
import express from 'express';
import {
	AchievementsController,
	AuthController,
	LeaderboardController,
	LocationsController,
} from './controllers';

import prisma from './client';
import { json, urlencoded } from 'body-parser';
import { Container } from '@decorators/di';
import { AuthMiddleware, AUTH_MIDDLEWARE } from './middleware/AuthMiddleware';

const startServer = async () => {
	const app = express();

	app.use(
		urlencoded({
			extended: true,
		})
	);
	app.use(json());

	const port = process.env.PORT || 8000;

	Container.provide([
		{
			provide: AUTH_MIDDLEWARE,
			useClass: AuthMiddleware,
		},
	]);

	attachControllers(app, [
		LocationsController,
		AuthController,
		AchievementsController,
		LeaderboardController,
	]);

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
