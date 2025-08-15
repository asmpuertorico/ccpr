import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "events");

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get("pc_admin")?.value;
    if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { url } = await req.json();
    if (!url || typeof url !== "string") return NextResponse.json({ message: "url required" }, { status: 400 });

    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!res.ok || !res.body) return NextResponse.json({ message: `Fetch failed: ${res.status}` }, { status: 400 });

    const ct = res.headers.get("content-type") || "";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) return NextResponse.json({ message: "File too large (max 8MB)" }, { status: 413 });

    // Some CDNs (like Eventbrite img.evbuc.com) may not send a strict image content-type
    const sniffedExt = extFromBuffer(buf);
    if (!ct.startsWith("image/") && !sniffedExt && !extFromUrl(url)) {
      return NextResponse.json({ message: "Not an image" }, { status: 415 });
    }

    let ext = extFromContentType(ct) || sniffedExt || extFromUrl(url) || ".img";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
    const publicPath = `/images/events/${name}`;
    return NextResponse.json({ path: publicPath });
  } catch (e) {
    return NextResponse.json({ message: "Copy failed" }, { status: 500 });
  }
}

function extFromContentType(ct: string): string | null {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
  };
  return map[ct] || null;
}

function extFromUrl(u: string): string | null {
  try {
    const p = new URL(u).pathname.toLowerCase();
    const m = p.match(/\.([a-z0-9]+)$/);
    return m ? `.${m[1]}` : null;
  } catch { return null; }
}

function extFromBuffer(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) return ".jpg";
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return ".png";
  // GIF
  if (buf.slice(0,3).toString("ascii") === "GIF") return ".gif";
  // WEBP (RIFF .... WEBP)
  if (buf.slice(0,4).toString("ascii") === "RIFF" && buf.slice(8,12).toString("ascii") === "WEBP") return ".webp";
  // AVIF / HEIC (ftypavif, ftypheic)
  if (buf.slice(4,8).toString("ascii") === "ftyp") {
    const brand = buf.slice(8,12).toString("ascii");
    if (brand.startsWith("avif")) return ".avif";
    if (brand.startsWith("heic") || brand.startsWith("heix") || brand.startsWith("hevc")) return ".heic";
  }
  return null;
}


