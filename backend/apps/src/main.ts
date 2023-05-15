if (process.env.INCLUDE_DOTENV == 'true') {
    import('dotenv').then((dotenv) => dotenv.config());
}

import * as toobusy from 'toobusy-js';
import app from './app';
import logger from './middleware/logger';
import prisma from './prisma/client';
import { host, port } from './utils/env.config';

const server = app.listen(port, '0.0.0.0', () => {
    prisma.$connect().then(() => {
        logger.info(`Listening on port ${port}`);
    });
});

server.on('error', console.error);

process.on('SIGINT', () => {
    server.close();
    toobusy.shutdown();
    process.exit();
});

process.on(
    'uncaughtException',
    (err: Error, origin: NodeJS.UncaughtExceptionOrigin) => {
        logger.error(`======== Uncaught Exception (${origin}) Found ========`);
        logger.error(err.stack);
    }
);
