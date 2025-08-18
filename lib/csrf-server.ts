import { randomBytes, createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const CSRF_SECRET = process.env.CSRF_SECRET || 'fallback-csrf-secret-for-development';
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generates a CSRF token
 */
export function generateCSRFToken(): string {
  const randomValue = randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const payload = `${randomValue}.${timestamp}`;
  
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');
    
  return `${payload}.${signature}`;
}

/**
 * Validates a CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const [randomValue, timestamp, signature] = parts;
    const payload = `${randomValue}.${timestamp}`;
    
    // Verify signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('hex');
      
    if (signature !== expectedSignature) return false;
    
    // Check if token is not too old (1 hour max)
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    return (now - tokenTime) <= maxAge;
  } catch {
    return false;
  }
}

/**
 * Gets CSRF token from cookies (SERVER-SIDE ONLY)
 */
export function getCSRFTokenFromCookies(): string | null {
  try {
    const cookieStore = cookies();
    return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Gets CSRF token from request headers
 */
export function getCSRFTokenFromHeaders(req: NextRequest): string | null {
  return req.headers.get(CSRF_HEADER_NAME);
}

/**
 * Validates CSRF token from request (SERVER-SIDE ONLY)
 */
export function validateCSRFFromRequest(req: NextRequest): boolean {
  const cookieToken = getCSRFTokenFromCookies();
  const headerToken = getCSRFTokenFromHeaders(req);
  
  if (!cookieToken || !headerToken) return false;
  if (cookieToken !== headerToken) return false;
  
  return validateCSRFToken(cookieToken);
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };

