import jwt from 'jsonwebtoken';
import config from '../config';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

export interface DecodedToken extends JWTPayload {
  iat: number;
  exp: number;
}

/**
 * Generate a JWT access token with user payload
 * @param payload - User information to encode in token
 * @returns JWT token string
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  } as any);
}

/**
 * Generate a JWT refresh token with user payload
 * @param payload - User information to encode in token
 * @returns JWT refresh token string
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn
  } as any);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}
