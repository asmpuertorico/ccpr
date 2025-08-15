import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "images", "sponsors");
    const files = await fs.readdir(dir).catch(() => []);
    const images = files
      .filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f))
      .map((f) => `/images/sponsors/${f}`);
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}


