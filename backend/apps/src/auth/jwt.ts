import { Role } from '@prisma/client';
import logger from 'apps/src/middleware/logger';
import { DEV, secrets, TEST } from 'apps/src/utils/env.config';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { validateUserInJWT } from '../crud/auth.crud';
import { ProtectedRequest } from '../types/req.types';

export interface IJWT {
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export const generateAuthToken = (email: string, role: string): string => {
    try {
        return jwt.sign({ email, role }, secrets.auth, { expiresIn: '15m' });
    } catch (err) {
        logger.error(`Error generating auth token: ${err.message}`);
        return '';
    }
};

export const generateRefreshToken = (email: string, role: string): string => {
    try {
        return jwt.sign({ email, role }, secrets.refresh, { expiresIn: '14d' });
    } catch (err) {
        logger.error(`Error generating refresh token: ${err.message}`);
        return '';
    }
};

export const validateAuthToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, secrets.auth);
        if (typeof decoded === 'string') {
            logger.error(`Cannot validate auth token: ${decoded}`);
            return;
        }
        return decoded as IJWT;
    } catch (err) {
        logger.error('Auth Token invalid. Failed to validate');
        return;
    }
};

export const validateRefreshToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, secrets.refresh);
        if (typeof decoded === 'string') {
            logger.error(`Cannot validate refresh token: ${decoded}`);
            return;
        }
        return decoded as IJWT;
    } catch (err) {
        logger.error('Refresh Token invalid. Failed to validate');
        return;
    }
};

export const jwtValidation = async (
    req: ProtectedRequest,
    res: Response,
    next: NextFunction
) => {
    const { authorization } = req.headers;

    if (TEST || DEV) {
        return next();
    }

    if (!authorization) {
        logger.error('Header does not container Authentication');
        return res.status(401).json({ msg: 'Access Denied' });
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
        logger.error('Type does not match and/or token is invalid');
        return res.status(401).json({ msg: 'Access Denied' });
    }

    try {
        const verified = jwt.verify(token, secrets.auth);

        if (typeof verified === 'string') {
            logger.error(`Access Denied: ${verified}`);
            return res.status(401).json({ msg: `Access Denied` });
        }

        const isValid = await validateUserInJWT(verified.email, verified.role);

        if (isValid) {
            req.email = verified.email;

            req.role = Role[verified.role as keyof typeof Role];
            return next();
        }

        return res.status(401).json({ msg: 'Access Denied. Invalid Token' });
    } catch (err) {
        logger.error(err.message);
        return res.status(401).json({ msg: 'Invalid Token' });
    }
};
