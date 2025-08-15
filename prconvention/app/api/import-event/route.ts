import { NextRequest, NextResponse } from "next/server";

type Imported = {
  name?: string;
  description?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  image?: string; // remote url
  planner?: string;
  ticketsUrl?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ message: "url required" }, { status: 400 });
    }
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!res.ok) return NextResponse.json({ message: `Fetch failed: ${res.status}` }, { status: 400 });
    const html = await res.text();

    // Try JSON-LD first
    const jsonldMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    let data: Imported | null = null;
    for (const m of jsonldMatches) {
      const raw = (m[1] || "").trim();
      try {
        const parsed = JSON.parse(raw);
        const nodes: any[] = Array.isArray(parsed)
          ? parsed
          : parsed && Array.isArray((parsed as any)["@graph"]) 
          ? (parsed as any)["@graph"]
          : [parsed];
        for (const node of nodes) {
          const t = node?.["@type"];
          const isEvent = (Array.isArray(t) ? t : [t]).some((x) => String(x).toLowerCase() === "event");
          if (isEvent) {
            const start: string | undefined = node.startDate || node.start_date || node.start_time;
            const image = Array.isArray(node.image) ? node.image[0] : node.image;
            const when = normalizeDateTimePreferRaw(start);
            data = {
              name: node.name || undefined,
              description: (node.description as string | undefined) || undefined,
              date: when?.date,
              time: when?.time,
              image: image || undefined,
              planner: node.organizer?.name || node.performer?.name || undefined,
            };
            break;
          }
        }
        if (data) break;
      } catch {
        // ignore JSON parse errors and continue
      }
    }

    // Fallback to OpenGraph
    if (!data) {
      const og = (prop: string) => getMeta(html, prop) || getMeta(html, prop, "name");
      const title = og("og:title") || getTitle(html);
      const description = og("og:description") || getMeta(html, "description", "name");
      const image = og("og:image");
      data = { name: title || undefined, description: description || undefined, image: image || undefined };
    }

    // Enrich missing fields from HTML (Eventbrite specific fallbacks)
    if (!data.planner) {
      const byMatch = html.match(/>\s*By\s+([^<]+)</i);
      if (byMatch) data.planner = byMatch[1].trim();
    }
    if (!data.date || !data.time) {
      const dtMeta = getMeta(html, "event:start_time", "name") || getMeta(html, "event:date", "name");
      const when = normalizeDateTimePreferRaw(dtMeta || "");
      if (when) { data.date = when.date; data.time = when.time; }
    }
    // Try to pull the About section text
    if (!data.description) {
      const about = extractAbout(html);
      if (about) data.description = about;
    }

    if (!data) data = {};
    // Ensure tickets url is present
    if (!data.ticketsUrl) data.ticketsUrl = url;
    // Extra planner fallback
    if (!data.planner) data.planner = extractPlanner(html) || undefined;
    // Final datetime fallback
    if (!data.date || !data.time) {
      const iso = findFirstISODate(html);
      const when = normalizeDateTimePreferRaw(iso || undefined);
      if (when) { data.date = when.date; data.time = when.time; }
    }

    return NextResponse.json({ event: data });
  } catch (e) {
    return NextResponse.json({ message: "Import failed" }, { status: 500 });
  }
}

function getMeta(html: string, name: string, attr: "property" | "name" = "property") {
  const re = new RegExp(`<meta[^>]*${attr}=[\"']${escapeReg(name)}[\"'][^>]*content=[\"']([^\"']+)[\"'][^>]*>`, "i");
  const m = html.match(re);
  return m?.[1] || "";
}

function getTitle(html: string) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m?.[1]?.trim() || "";
}

// Prefer taking date/time directly from the raw string (preserve local time component if timezone exists)
function normalizeDateTimePreferRaw(input?: string): { date: string; time: string } | null {
  if (!input) return null;
  // ISO with timezone: YYYY-MM-DDTHH:mm(:ss)?(Z|[+-]HH:mm)
  const m = input.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
  if (m) return { date: m[1], time: m[2] };
  // Fallback to Date parse
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

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractAbout(html: string): string {
  // Grab content between 'About this event' heading and the next major heading like 'Tags'
  const startIdx = html.toLowerCase().indexOf("about this event");
  if (startIdx === -1) return "";
  const chunk = html.slice(startIdx);
  const endIdx = chunk.toLowerCase().indexOf("tags");
  const segment = endIdx > -1 ? chunk.slice(0, endIdx) : chunk;
  // Strip tags and decode some entities
  const text = segment
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();
  return text;
}

function extractPlanner(html: string): string {
  // Look for patterns like: By <a ...>Organizer</a>
  const m = html.match(/>\s*By\s*<[^>]*>([^<]+)<\/a>/i);
  if (m) return m[1].trim();
  // Fallback: plain text after "By "
  const m2 = html.match(/>\s*By\s+([^<\n]+)</i);
  return m2 ? m2[1].trim() : "";
}

function findFirstISODate(html: string): string | null {
  const m = html.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(:\d{2})?([zZ]|[+\-]\d{2}:?\d{2})?/);
  return m ? m[0] : null;
}


