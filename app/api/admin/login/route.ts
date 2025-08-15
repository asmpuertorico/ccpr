import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ message: "ADMIN_PASSWORD missing" }, { status: 400 });
  }
  if (password !== expected) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("pc_admin", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return res;
}



