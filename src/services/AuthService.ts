import { Injectable } from '@decorators/di';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../client';

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
	private readonly JWT_SECRET: string;

	constructor() {
		this.JWT_SECRET = process.env.JWT_SECRET || 'the sky is blue';
	}

	async validateCredentials(data: z.infer<typeof LoginSchema>) {
		const values = LoginSchema.safeParse(data);

		if (!values.success) {
			throw new Error('Invalid Credentials');
		}

		const { email, password } = values.data;

		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			throw new Error('Invalid Credentials');
		}

		const isValidPassword = await compare(password, user.hashedPassword);

		if (!isValidPassword) {
			throw new Error('Invalid Credentials');
		}

		return user;
	}

	async createTokens(user: User) {
		const accessToken = sign(
			{
				id: user.id,
				email: user.email,
			},
			this.JWT_SECRET,
			{
				expiresIn: '1d',
			}
		);

		return {
			accessToken,
		};
	}

	async validateToken(token: string) {
		try {
			const payload = verify(token, this.JWT_SECRET) as { id: string };

			const user = await prisma.user.findUnique({
				where: {
					id: payload.id,
				},
			});

			if (!user) {
				throw new Error('Invalid Token');
			}

			return user;
		} catch {
			return undefined;
		}
	}

	async createUser(data: z.infer<typeof RegisterSchema>) {
		const values = RegisterSchema.safeParse(data);

		if (!values.success) {
			throw new Error('Invalid Input');
		}

		const { email, password } = values.data;

		const userExists = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (userExists) {
			throw new Error('User already exists');
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
