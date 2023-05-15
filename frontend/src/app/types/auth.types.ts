import { Role } from './enums';
import { User } from './user.types';

export interface AuthResponse {
    user: User;
    role: Role,
    refreshToken: string;
    authToken: string;
};

export interface DecodedJWT {
    email: string;
    role: string;
    iat: number;
    exp: number;
};
