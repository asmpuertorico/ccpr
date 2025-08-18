import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const JWT_EXPIRES_IN = '12h';
const COOKIE_NAME = 'pc_admin_token';

export interface JWTPayload {
  userId: string;
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Signs a JWT token for admin authentication
 */
export function signToken(payload: { userId: string; role: 'admin' }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'prconvention-admin',
    audience: 'prconvention-admin'
  });
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'prconvention-admin',
      audience: 'prconvention-admin'
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.warn('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Gets the current admin session from cookies
 */
export function getCurrentSession(): JWTPayload | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!token) {
      return null;
    }
    
    return verifyToken(token);
  } catch (error) {
    console.warn('Failed to get current session:', error);
    return null;
  }
}

/**
 * Checks if the current session is valid and user is admin
 */
export function isAuthenticated(): boolean {
  const session = getCurrentSession();
  return session !== null && session.role === 'admin';
}

/**
 * Gets time until token expires (in seconds)
 */
export function getTokenExpirationTime(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload | null;
    if (!decoded || !decoded.exp) return null;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - now);
  } catch {
    return null;
  }
}

/**
 * Checks if token will expire soon (within 30 minutes)
 */
export function isTokenExpiringSoon(token: string): boolean {
  const timeLeft = getTokenExpirationTime(token);
  return timeLeft !== null && timeLeft < 30 * 60; // 30 minutes
}

export { COOKIE_NAME, JWT_EXPIRES_IN };

