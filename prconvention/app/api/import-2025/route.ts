import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { getStorage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get("pc_admin")?.value;
    if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { input = "events-2025.json", copyImages = true, dryRun = false, limit, start = 0 } = await req.json();
    const abs = path.join(process.cwd(), "public", input);
    const raw = await fs.readFile(abs, "utf8");
    const data = JSON.parse(raw) as { events: any[] };
    const base = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const storage = getStorage();
    const results: any[] = [];
    const errors: any[] = [];
    const list = Array.isArray(data?.events) ? data.events.slice(start, limit ? start + limit : undefined) : [];
    if (!list.length) return NextResponse.json({ ok: false, message: 'No events to import (check JSON shape: {"events": [...]})' }, { status: 400 });

    for (const e of list) {
      try {
        // Prefer normalized local image if present, else fall back to original remote
        let image: string | undefined = (e.image as string | undefined) || (e.imageOriginal as string | undefined);

        // If we're asked to copy, and we only have a remote URL (imageOriginal), copy now
        if (copyImages && !e.image && e.imageOriginal) {
          const copyRes = await fetch(`${base}/api/uploads/fetch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: e.imageOriginal }) }).catch(()=>null);
          if (copyRes && copyRes.ok) {
            const j = await copyRes.json();
            image = j.path || undefined;
          }
        }
        const item = {
          name: e.name,
          date: e.date,
          time: e.time,
          planner: 'PRConvention',
          image,
          ticketsUrl: e.ticketsUrl || undefined,
          description: e.description || undefined,
        };
        if (dryRun) {
          results.push({ preview: item });
        } else {
          const created = await storage.create(item as any);
          results.push({ id: created.id, name: created.name });
        }
      } catch (err: any) {
        errors.push({ name: e?.name, error: String(err?.message || err) });
      }
    }
    return NextResponse.json({ ok: errors.length === 0, count: results.length, errors });
  } catch (e) {
    return NextResponse.json({ message: 'Import failed' }, { status: 500 });
  }
}


