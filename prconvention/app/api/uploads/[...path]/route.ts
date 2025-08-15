import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function DELETE(_req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const segments = params.path;
    // Only allow deleting inside public/images/events
    const rel = segments.join("/");
    const baseDir = path.join(process.cwd(), "public", "images", "events");
    const target = path.join(baseDir, rel);
    if (!target.startsWith(baseDir)) {
      return NextResponse.json({ message: "Invalid path" }, { status: 400 });
    }
    await fs.unlink(target).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}



