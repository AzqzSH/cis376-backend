import { Injectable } from '@decorators/di';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../client';
import { BadRequest } from '../exceptions/BadRequestError';
import { ValidationError } from '../exceptions/ValidationError';

const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

const RegisterSchema = z.object({
	email: z.string().email().endsWith('@umich.edu'),
	password: z
		.string()
		.min(8)
		.max(20)
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/),
});

@Injectable()
export class AuthService {
	private readonly ACCESS_TOKEN_SECRET: string;
	private readonly REFRESH_TOKEN_SECRET: string;

	constructor() {
		this.ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'the sky is blue';
		this.REFRESH_TOKEN_SECRET =
			process.env.REFRESH_TOKEN_SECRET || 'the sky is red';
	}

	async validateCredentials(data: z.infer<typeof LoginSchema>) {
		const values = LoginSchema.safeParse(data);

		if (!values.success) {
			throw new BadRequest('Invalid Credentials');
		}

		const { email, password } = values.data;

		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			throw new BadRequest('Invalid Credentials');
		}

		const isValidPassword = await compare(password, user.hashedPassword);

		if (!isValidPassword) {
			throw new BadRequest('Invalid Credentials');
		}

		return user;
	}

	async createTokens(user: User) {
		const accessToken = sign(
			{
				id: user.id,
				email: user.email,
			},
			this.ACCESS_TOKEN_SECRET,
			{
				expiresIn: '1d',
			}
		);

		const refreshToken = sign(
			{
				id: user.id,
				email: user.email,
				version: user.tokenVersion,
			},
			this.REFRESH_TOKEN_SECRET,
			{
				expiresIn: '7d',
			}
		);

		return {
			accessToken,
			refreshToken,
		};
	}

	async validateToken(token: string) {
		try {
			const payload = verify(token, this.ACCESS_TOKEN_SECRET) as {
				id: string;
			};

			const user = await prisma.user.findUnique({
				where: {
					id: payload.id,
				},
			});

			if (!user) {
				throw new BadRequest('Invalid Token');
			}

			return user;
		} catch {
			return undefined;
		}
	}

	async refreshToken(refresh: string) {
		try {
			const payload = verify(refresh, this.REFRESH_TOKEN_SECRET) as {
				id: string;
				version: number;
			};

			const user = await prisma.user.findUnique({
				where: {
					id: payload.id,
				},
			});

			if (!user || payload.version !== user.tokenVersion) {
				throw new BadRequest('Invalid Token');
			}

			return this.createTokens(user);
		} catch {
			throw new BadRequest('Invalid Token');
		}
	}

	async invalidateToken(userId: string) {
		await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				tokenVersion: {
					increment: 1,
				},
			},
		});
	}

	async createUser(data: z.infer<typeof RegisterSchema>) {
		const values = RegisterSchema.safeParse(data);

		if (!values.success) {
			throw new ValidationError(values.error.errors);
		}

		const { email, password } = values.data;

		const userExists = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (userExists) {
			throw new BadRequest('User already exists');
		}

		const hashedPassword = await hash(password, 10);

		const user = await prisma.user.create({
			data: {
				email,
				hashedPassword,
			},
		});

		return user;
	}
}
