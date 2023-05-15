import * as jwt from 'jsonwebtoken';
import {
    generateAuthToken,
    generateRefreshToken,
    IJWT,
    validateAuthToken,
    validateRefreshToken,
} from '../auth/jwt';
import logger from '../middleware/logger';
import { secrets } from '../utils/env.config';
import { testUser } from './data';

const user = {
    email: testUser.email,
    password: testUser.password,
};

describe('generateAuthToken', () => {
    it('generates a valid auth token', () => {
        const token = generateAuthToken(user.email);
        expect(token).toBeTruthy;
        expect(token).not.toBeUndefined;

        const decoded = jwt.verify(token, secrets.auth) as IJWT;
        expect(decoded).toHaveProperty('email');
        expect(decoded).toHaveProperty('iat');
        expect(decoded).toHaveProperty('exp');
        expect(decoded.email).toMatch(user.email);

        const expectedExpiry = Math.floor(Date.now() / 1000) + 60 * 15;
        expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiry);
    });
});

describe('generateRefreshToken', () => {
    it('generates a valid refresh token', () => {
        const token = generateRefreshToken(user.email);
        expect(token).toBeTruthy;
        expect(token).not.toBeUndefined;

        const decoded = jwt.verify(token, secrets.refresh) as IJWT;
        expect(decoded).toHaveProperty('email');
        expect(decoded).toHaveProperty('iat');
        expect(decoded).toHaveProperty('exp');
        expect(decoded.email).toMatch(user.email);

        const expectedExpiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
        expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiry);
    });
});

describe('validateAuthToken', () => {
    it('validates a valid auth token', () => {
        const token = jwt.sign({ email: user.email }, secrets.auth, {
            expiresIn: '15m',
        });
        const decoded = validateAuthToken(token) as IJWT;
        expect(decoded).toHaveProperty('email');
        expect(decoded).toHaveProperty('iat');
        expect(decoded).toHaveProperty('exp');
        expect(decoded.email).toMatch(user.email);

        const expectedExpiry = Math.floor(Date.now() / 1000) + 60 * 15;
        expect(decoded?.exp).toBeGreaterThanOrEqual(expectedExpiry);
    });

    it('rejects an invalid auth token', () => {
        const token = jwt.sign({ user: user.email }, secrets.refresh, {
            expiresIn: '15m',
        });
        const decoded = validateAuthToken(token);
        expect(decoded).toBeUndefined;
    });
});

describe('validateRefreshToken', () => {
    it('validates a valid refresh token', () => {
        const token = jwt.sign({ email: user.email }, secrets.refresh, {
            expiresIn: '14d',
        });
        const decoded = validateRefreshToken(token) as IJWT;
        expect(decoded).toHaveProperty('email');
        expect(decoded).toHaveProperty('iat');
        expect(decoded).toHaveProperty('exp');
        expect(decoded.email).toMatch(user.email);

        const expectedExpiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
        expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiry);
    });

    it('rejects an invalid refresh token', () => {
        const token = jwt.sign({ email: user.email }, secrets.auth, {
            expiresIn: '14d',
        });
        const decoded = validateRefreshToken(token);
        expect(decoded).toBeUndefined;
    });
});
