import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';
import { TEST } from '../utils/env.config';
import prisma from './client';

let prismaClient: PrismaClient | DeepMockProxy<PrismaClient>;

if (TEST) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { prismaMock } = require('./singleton');
    prismaClient = prismaMock;
} else {
    prismaClient = prisma;
}

export const prismaModels = Object.keys(prismaClient).filter((modelName: string) => (
    /^[a-zA-Z]/.test(modelName)
))

export default prismaClient;
