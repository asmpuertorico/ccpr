import { NextRequest, NextResponse } from "next/server";
import { signToken, COOKIE_NAME } from "@/lib/jwt";

// Rate limiting storage (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

function isRateLimited(clientIP: string): boolean {
  const attempts = loginAttempts.get(clientIP);
  if (!attempts) return false;
  
  const now = Date.now();
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(clientIP);
    return false;
  }
  
  return attempts.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(clientIP: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(clientIP);
  
  if (!attempts) {
    loginAttempts.set(clientIP, { count: 1, lastAttempt: now });
  } else {
    attempts.count += 1;
    attempts.lastAttempt = now;
  }
}

function clearFailedAttempts(clientIP: string): void {
  loginAttempts.delete(clientIP);
}

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    
    // Check rate limiting
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { message: "Too many failed attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }
    
    const { password } = await req.json();
    
    // Validate input
    if (!password || typeof password !== 'string') {
      recordFailedAttempt(clientIP);
      return NextResponse.json({ message: "Password is required" }, { status: 400 });
    }
    
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }
    
    if (password !== expected) {
      recordFailedAttempt(clientIP);
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }
    
    // Success - clear failed attempts and create JWT
    clearFailedAttempts(clientIP);
    
    const token = signToken({
      userId: 'admin',
      role: 'admin'
    });
    
    const res = NextResponse.json({ 
      ok: true,
      message: "Login successful"
    });
    
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });
    
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}



