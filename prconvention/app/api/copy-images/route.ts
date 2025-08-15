import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

type EventsDoc = { events: Array<{ imageOriginal?: string; image?: string }> };

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get("pc_admin")?.value;
    if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { input = "events-2025.json", field = "imageOriginal" } = await req.json();
    const inAbs = path.join(process.cwd(), "public", input);
    const raw = await fs.readFile(inAbs, "utf8");
    const data = JSON.parse(raw) as EventsDoc;

    const outDir = path.join(process.cwd(), "public", "images", "events");
    await fs.mkdir(outDir, { recursive: true });

    const results: any[] = [];
    const errors: any[] = [];

    for (const e of data.events) {
      const src = (e as any)[field] as string | undefined;
      if (!src) continue;
      try {
        const url = new URL(src);
        const base = path.basename(url.pathname);
        const dest = path.join(outDir, base);

        // Download
        const res = await fetch(src, { headers: { "user-agent": "Mozilla/5.0" } });
        if (!res.ok || !res.body) throw new Error("download failed: " + res.status);
        const buf = Buffer.from(await res.arrayBuffer());
        await fs.writeFile(dest, buf);
        results.push({ src, savedAs: `/images/events/${base}` });
      } catch (err: any) {
        errors.push({ src, error: String(err?.message || err) });
      }
    }

    return NextResponse.json({ ok: errors.length === 0, saved: results.length, errors });
  } catch (e) {
    return NextResponse.json({ message: "Copy failed" }, { status: 500 });
  }
}



