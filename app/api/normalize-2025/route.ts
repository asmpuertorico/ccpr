import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { findAssetByOriginal, saveAsset } from "@/lib/assets";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get("pc_admin")?.value;
    if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { input = "events-2025.json", output = "events-2025-local.json" } = await req.json();
    const base = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const inAbs = path.join(process.cwd(), "public", input);
    const outAbs = path.join(process.cwd(), "public", output);
    const raw = await fs.readFile(inAbs, "utf8");
    const data = JSON.parse(raw) as { events: any[] };
    const updated: any[] = [];

    for (const e of data.events) {
      let localPath: string | undefined;
      if (e.imageOriginal) {
        const cached = await findAssetByOriginal(e.imageOriginal);
        if (cached?.local_path) {
          localPath = cached.local_path;
        } else {
          // Copy to our storage via upload fetch endpoint
          const copyRes = await fetch(`${base}/api/uploads/fetch`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: e.imageOriginal })
          }).catch(()=>null);
          if (copyRes && copyRes.ok) {
            const j = await copyRes.json();
            localPath = j.path;
            await saveAsset(e.imageOriginal, localPath);
          }
        }
      }
      updated.push({ ...e, image: localPath || undefined });
    }

    await fs.writeFile(outAbs, JSON.stringify({ events: updated }, null, 2), "utf8");
    return NextResponse.json({ ok: true, output, count: updated.length });
  } catch (e) {
    return NextResponse.json({ message: 'Normalize failed' }, { status: 500 });
  }
}



