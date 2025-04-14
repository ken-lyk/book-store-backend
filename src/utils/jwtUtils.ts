import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../entities/User'; // Import User entity for payload type

export interface JwtPayload {
    id: string;
    role: User['role'];
    // Add other fields if needed, but keep payload small
}
export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
        console.error('JWT Verification Error:', error);
        return null;
    }
};