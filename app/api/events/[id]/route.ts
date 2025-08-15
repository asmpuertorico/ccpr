import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await getStorage().get(params.id);
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const cookie = req.cookies.get("pc_admin")?.value;
  if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const updates = await req.json();
  const updated = await getStorage().update(params.id, updates);
  if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const cookie = req.cookies.get("pc_admin")?.value;
  if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const ok = await getStorage().delete(params.id);
  return NextResponse.json({ ok });
}



