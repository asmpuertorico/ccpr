import { EventItem, isEventItem, sortByDateAsc } from "./events";
import seed from "../data/events.seed.json" assert { type: "json" };
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

export type StorageProvider = {
  list(): Promise<EventItem[]>;
  get(id: string): Promise<EventItem | undefined>;
  create(event: Omit<EventItem, "id">): Promise<EventItem>;
  update(id: string, updates: Partial<Omit<EventItem, "id">>): Promise<EventItem | undefined>;
  delete(id: string): Promise<boolean>;
  replaceAll(events: EventItem[]): Promise<void>;
};

let memoryStore: EventItem[] | null = null;
const BLOB_PATH = process.env.EVENTS_BLOB_PATH || "events.json";
const POSTGRES_URL = process.env.POSTGRES_URL;

async function loadFromBlob(): Promise<EventItem[] | null> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
    // For now, return null to skip blob loading since get is not available
    return null;
  } catch {
    return null;
  }
}

async function ensureSeeded() {
  if (!memoryStore) {
    // Prefer Neon DB if configured
    if (POSTGRES_URL) {
      try {
        const sql = neon(POSTGRES_URL);
        const rows = await sql`select id::text, name, to_char(date,'YYYY-MM-DD') as date, to_char(time,'HH24:MI') as time, planner, image, tickets_url as "ticketsUrl", description from events order by date desc, time desc` as EventItem[];
        memoryStore = rows.filter(isEventItem).sort(sortByDateAsc);
        return;
      } catch (e) {
        // fall back if query fails
      }
    }
    const fromBlob = await loadFromBlob();
    const initial = fromBlob ?? (Array.isArray(seed) ? (seed as EventItem[]) : []);
    memoryStore = initial.filter(isEventItem).slice().sort(sortByDateAsc);
  }
}

async function persistToBlob(data: EventItem[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return; // skip if not configured
  const url = `blob://${BLOB_PATH}`;
  const body = JSON.stringify(data, null, 2);
  await put(url, new Blob([body], { type: "application/json" }), {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

async function persistToNeon(data: EventItem[]): Promise<void> {
  if (!POSTGRES_URL) return;
  const sql = neon(POSTGRES_URL);
  // Use transaction to upsert/replace: simplest is truncate and bulk insert for this demo
  await sql`begin`;
  try {
    await sql`truncate table events`;
    for (const e of data) {
      await sql`insert into events (id, name, date, time, planner, image, tickets_url, description)
                values (${e.id}::uuid, ${e.name}, ${e.date}::date, ${e.time}::time, ${e.planner}, ${e.image}, ${e.ticketsUrl ?? null}, ${e.description ?? null})`;
    }
    await sql`commit`;
  } catch (err) {
    await sql`rollback`;
    throw err;
  }
}

const inMemoryProvider: StorageProvider = {
  async list() {
    await ensureSeeded();
    return memoryStore!.slice().sort(sortByDateAsc);
  },
  async get(id) {
    await ensureSeeded();
    return memoryStore!.find((e) => e.id === id);
  },
  async create(event) {
    await ensureSeeded();
    const item: EventItem = { id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10), ...event };
    memoryStore!.push(item);
    memoryStore = memoryStore!.sort(sortByDateAsc);
    await persistToNeon(memoryStore!);
    await persistToBlob(memoryStore!);
    return item;
  },
  async update(id, updates) {
    await ensureSeeded();
    const idx = memoryStore!.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    const updated = { ...memoryStore![idx], ...updates } as EventItem;
    memoryStore![idx] = updated;
    memoryStore = memoryStore!.sort(sortByDateAsc);
    await persistToNeon(memoryStore!);
    await persistToBlob(memoryStore!);
    return updated;
  },
  async delete(id) {
    await ensureSeeded();
    const before = memoryStore!.length;
    memoryStore = memoryStore!.filter((e) => e.id !== id);
    const changed = memoryStore!.length < before;
    if (changed) { await persistToNeon(memoryStore!); await persistToBlob(memoryStore!); }
    return changed;
  },
  async replaceAll(events) {
    memoryStore = events.filter(isEventItem).slice().sort(sortByDateAsc);
    await persistToNeon(memoryStore!);
    await persistToBlob(memoryStore!);
  },
};

export function getStorage(): StorageProvider {
  // In the future, plug in hosted DB providers here based on env flags.
  return inMemoryProvider;
}

