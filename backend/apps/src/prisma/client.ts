import { PrismaClient } from '@prisma/client';
import { DEV, environment } from '../utils/env.config';

/**
 * This file contains code to prevent multiple prisma instances from being created
 */

type NodeJsGlobal = typeof globalThis;

interface CustomNodeJsGlobal extends NodeJsGlobal {
    prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

const prisma = global.prisma || new PrismaClient();

if (DEV) {
    global.prisma = prisma;
}

export default prisma;
