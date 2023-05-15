import { env } from 'process';

export const environment = env.NODE_ENV || 'development';
export const PROD = env.NODE_ENV === 'production';
export const TEST = env.NODE_ENV === 'test';
export const DEV = env.NODE_ENV === 'development';

export const host = env.HOST || (PROD ? '0.0.0.0' : 'localhost');
export const port: number = Number(env.PORT) || 5000;

export const secrets = {
    auth: env.AUTH_SECRET || '',
    refresh: env.REFRESH_SECRET || '',
};

export const aws = {
    general: {
        accessKeyId: env.AWS_ACCESS_KEY_ID || '',
        secretAccessKeyId: env.AWS_SECRET_ACCESS_KEY_ID || '',
        region: env.DEFAULT_REGION || 'us-east-1',
    },
};
