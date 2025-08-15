import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";
import { getStorage } from "@/lib/storage";

type Row = Record<string, string>;

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get("pc_admin")?.value;
    if (cookie !== "1") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let dryRun = false as boolean;
    let limit: number | undefined;
    let csvText = "";
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      dryRun = String(form.get("dryRun") || "false") === "true";
      const lim = form.get("limit");
      if (typeof lim === "string" && lim) limit = Number(lim);
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ message: "file required" }, { status: 400 });
      csvText = await file.text();
    } else {
      const body = await req.json();
      const { filePath, limit: jLimit, dryRun: jDry } = body || {};
      dryRun = Boolean(jDry);
      limit = typeof jLimit === "number" ? jLimit : undefined;
      const abs = filePath && filePath.startsWith("/")
        ? filePath
        : path.join(process.cwd(), "public", filePath || "Eventos Puerto Rico Convention Center.csv");
      csvText = await fs.readFile(abs, "utf8");
    }

    const records: Row[] = parse(csvText, { columns: true, skip_empty_lines: true });

    const storage = getStorage();
    const results: any[] = [];

    const trimmed = typeof limit === "number" ? records.slice(0, limit) : records;
    for (const row of trimmed) {
      const name = clean(row["Title"]);
      if (!name) continue;
      // date time
      const dt = row["Start Date"]?.trim();
      let when = toDateTime(dt);

      const ticketsUrl = clean(row["External Link"]);
      const description = combineDesc(row["Short Description"], row["Description"]);
      // image: try to copy if link exists
      let image = "";
      if (ticketsUrl) {
        try {
          const details = await discoverDetails(ticketsUrl);
          const imgUrl = details?.image || null;
          // If CSV time is missing (00:00) or not provided, try to use discovered time
          if ((!when || when.time === "00:00") && (details?.date || details?.time)) {
            const from = combineDateTime(when?.date, details?.date, details?.time);
            if (from) when = from;
          }

          if (imgUrl) {
            const base = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
            // Resolve relative image url
            const resolved = new URL(imgUrl, ticketsUrl).toString();
            const copyRes = await fetch(`${base}/api/uploads/fetch`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: resolved }),
            }).catch(()=>null);
            if (copyRes && copyRes.ok) {
              const j = await copyRes.json();
              image = j.path || "";
            }
          }
        } catch {}
      }

      // Ensure we have some date; if still missing skip
      if (!when) continue;

      const item = {
        name,
        date: when.date,
        time: when.time,
        planner: "PRConvention",
        image,
        ticketsUrl: ticketsUrl || undefined,
        description,
      };

      results.push({ action: dryRun ? "preview" : "insert", item });
      if (!dryRun) {
        await storage.create(item as any);
      }
    }

    return NextResponse.json({ count: results.length, results });
  } catch (e) {
    return NextResponse.json({ message: "Import failed" }, { status: 500 });
  }
}

function clean(s?: string) { return (s || "").replace(/&nbsp;/g, " ").trim(); }

function toDateTime(input?: string): { date: string; time: string } | null {
  if (!input) return null;
  const m = input.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}):\d{2}$/);
  if (m) return { date: m[1], time: m[2] };
  return null;
}

async function discoverDetails(url: string): Promise<{ image?: string; date?: string; time?: string } | null> {
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const html = await res.text();
    const og = getMeta(html, "og:image") || getMeta(html, "og:image", "name");
    let image: string | undefined = og || undefined;
    let date: string | undefined;
    let time: string | undefined;
    const jsonld = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const m of jsonld) {
      try {
        const raw = m[1] || "";
        const parsed = JSON.parse(raw);
        const nodes: any[] = Array.isArray(parsed) ? parsed : (parsed as any)["@graph"] ? (parsed as any)["@graph"] : [parsed];
        for (const n of nodes) {
          const img = Array.isArray(n.image) ? n.image[0] : n.image;
          if (!image && img) image = img;
          const start: string | undefined = n.startDate || n.start_date || n.start_time;
          const when = normalizeDateTimePreferRaw(start);
          if (when) { date = when.date; time = when.time; }
        }
      } catch {}
    }
    // CSS background-image url(...)
    const bg = html.match(/background-image\s*:\s*url\(([^)]+)\)/i);
    if (!image && bg) image = stripQuotes(bg[1]);

    // Find time like 7:30 PM if still missing
    if (!time) {
      const tm = html.match(/(\b\d{1,2}:\d{2}\s*(AM|PM)\b)/i);
      if (tm) {
        const parsed = to24h(tm[1]);
        if (parsed) time = parsed;
      }
    }

    if (!image && !date && !time) return null;
    return { image, date, time };
  } catch { return null; }
}

function getMeta(html: string, name: string, attr: "property" | "name" = "property") {
  const re = new RegExp(`<meta[^>]*${attr}=[\"']${escapeReg(name)}[\"'][^>]*content=[\"']([^\"']+)[\"'][^>]*>`, "i");
  const m = html.match(re);
  return m?.[1] || "";
}

function stripQuotes(s: string) { return s.replace(/^['"]|['"]$/g, ""); }
function escapeReg(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function combineDesc(a?: string, b?: string) { return [clean(a), clean(b)].filter(Boolean).join("\n\n"); }

function normalizeDateTimePreferRaw(input?: string): { date: string; time: string } | null {
  if (!input) return null;
  const m = input.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
  if (m) return { date: m[1], time: m[2] };
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
  } catch { return null; }
}

function combineDateTime(csvDate?: string, htmlDate?: string, htmlTime?: string): { date: string; time: string } | null {
  const date = csvDate || htmlDate;
  if (!date) return null;
  const time = htmlTime || '10:00';
  return { date, time };
}

function to24h(s: string): string | null {
  const m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2,'0')}:${min}`;
}


