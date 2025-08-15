import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";

type Row = Record<string, string>;
type Img = { id: number; source_url: string };

export async function POST(req: NextRequest) {
  try {
    const { csvPath, mappingPath, output = "events-2025.json" } = await req.json();
    const csvAbs = path.join(process.cwd(), "public", csvPath || "Eventos Puerto Rico Convention Center.csv");
    const mapAbs = path.join(process.cwd(), "public", mappingPath || "images -mapping.json");
    const outAbs = path.join(process.cwd(), "public", output);

    const csvText = await fs.readFile(csvAbs, "utf8");
    const records: Row[] = parse(csvText, { columns: true, skip_empty_lines: true });

    const mapText = await fs.readFile(mapAbs, "utf8");
    const images = parseImageMapping(mapText);
    const idToUrl = new Map<number, string>(images.map(i => [i.id, i.source_url]));

    const results: any[] = [];
    for (const row of records) {
      const start = (row["Start Date"] || "").trim();
      if (!start.startsWith("2025")) continue;
      const m = start.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}):\d{2}$/);
      if (!m) continue;
      const date = m[1];
      const time = m[2];
      const imgIdRaw = (row["Images IDs"] || "").trim();
      const imgId = parseInt(imgIdRaw || "", 10);
      const imageOriginal = Number.isFinite(imgId) ? idToUrl.get(imgId) || "" : "";

      results.push({
        name: clean(row["Title"]),
        date,
        time,
        planner: "PRConvention",
        ticketsUrl: clean(row["External Link"]) || undefined,
        description: combineDesc(row["Short Description"], row["Description"]) || undefined,
        imageOriginal: imageOriginal || undefined,
      });
    }

    await fs.writeFile(outAbs, JSON.stringify({ events: results }, null, 2), "utf8");
    return NextResponse.json({ ok: true, count: results.length, output });
  } catch (e) {
    return NextResponse.json({ message: "Build failed" }, { status: 500 });
  }
}

function clean(s?: string) { return (s || "").replace(/&nbsp;/g, " ").trim(); }
function combineDesc(a?: string, b?: string) { return [clean(a), clean(b)].filter(Boolean).join("\n\n"); }

function parseImageMapping(text: string): Img[] {
  try {
    const j = JSON.parse(text);
    if (Array.isArray(j)) return j as Img[];
  } catch {}
  // Recover from concatenated arrays or malformed content by extracting objects
  const out: Img[] = [];
  const re = /\{\s*"id"\s*:\s*(\d+)\s*,\s*"source_url"\s*:\s*"([^"]+)"\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    out.push({ id: parseInt(m[1], 10), source_url: m[2] });
  }
  return out;
}



