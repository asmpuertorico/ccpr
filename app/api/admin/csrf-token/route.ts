import { NextRequest, NextResponse } from "next/server";
import { generateCSRFToken, CSRF_COOKIE_NAME } from "@/lib/csrf-server";
import { getCurrentSession } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    // Only authenticated users can get CSRF tokens
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const token = generateCSRFToken();
    
    const res = NextResponse.json({ 
      csrfToken: token 
    });
    
    // Set CSRF token in cookie
    res.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Allow JavaScript access for CSRF header
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });
    
    return res;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
