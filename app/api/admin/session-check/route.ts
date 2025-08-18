import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/jwt";

export async function GET() {
  try {
    const session = getCurrentSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ 
      valid: true, 
      expiresAt: session.exp * 1000 // Convert to milliseconds
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
