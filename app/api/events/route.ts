import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { isEventItem } from "@/lib/events";

export async function GET() {
  const events = await getStorage().list();
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("pc_admin")?.value;
  if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _ignored, ...rest } = body || {};
  if (!isEventItem({ id: "temp", ...rest })) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
  const created = await getStorage().create(rest);
  return NextResponse.json(created, { status: 201 });
}

// Replace all events with provided array (admin only)
export async function PUT(req: NextRequest) {
  const cookie = req.cookies.get("pc_admin")?.value;
  if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const events = Array.isArray(body?.events) ? body.events : [];
  await getStorage().replaceAll(events);
  return NextResponse.json({ ok: true });
}


