import { Role } from "@prisma/client";
import { Request } from 'express';

export interface ProtectedRequest extends Request {
    email: string;
    role: Role;
}