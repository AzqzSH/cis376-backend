import { Container } from '@decorators/di';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
