import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "events");

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get("pc_admin")?.value;
    if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: "File too large (max 8MB)" }, { status: 413 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = (file.name || "upload").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const ext = path.extname(originalName) || ".bin";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const outPath = path.join(UPLOAD_DIR, name);
    await fs.writeFile(outPath, buffer);

    const publicPath = `/images/events/${name}`;
    return NextResponse.json({ path: publicPath });
  } catch (e) {
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}



