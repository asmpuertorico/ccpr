import { EventItem, isEventItem, sortByDateAsc } from "./events";
import seed from "../data/events.seed.json" assert { type: "json" };
import localEvents from "../public/events-2025-local.json" assert { type: "json" };
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

export type StorageProvider = {
  list(): Promise<EventItem[]>;
  listFresh(): Promise<EventItem[]>; // Always fetch from database, bypass cache
  get(id: string): Promise<EventItem | undefined>;
  create(event: Omit<EventItem, "id">): Promise<EventItem>;
  update(id: string, updates: Partial<Omit<EventItem, "id">>): Promise<EventItem | undefined>;
  delete(id: string): Promise<boolean>;
  replaceAll(events: EventItem[]): Promise<void>;
};

let memoryStore: EventItem[] | null = null;
const BLOB_PATH = process.env.EVENTS_BLOB_PATH || "events.json";
const POSTGRES_URL = process.env.POSTGRES_URL;
const BLOB_DOMAIN = "https://gbqzdseftkxm9cmm.public.blob.vercel-storage.com";

// Convert local image paths to blob URLs
function convertImageUrl(imageUrl: string): string {
  if (!imageUrl) return imageUrl;
  
  // If it's already a blob URL, return as-is
  if (imageUrl.includes("blob.vercel-storage.com")) {
    return imageUrl;
  }
  
  // If it's a local path, convert to blob URL
  if (imageUrl.startsWith("/images/events/")) {
    const filename = imageUrl.replace("/images/events/", "");
    return `${BLOB_DOMAIN}/events/${filename}`;
  }
  
  return imageUrl;
}

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
        const rows = await sql`select id::text, name, date, time, planner, image, tickets_url as "ticketsUrl", description from events order by date desc, time desc` as EventItem[];
        memoryStore = rows
          .filter(isEventItem)
          .map(event => ({
            ...event,
            image: convertImageUrl(event.image)
          }))
          .sort(sortByDateAsc);
        return;
      } catch (e) {
        // fall back if query fails
      }
    }
    const fromBlob = await loadFromBlob();
    // Prefer local events file, then blob, then seed as fallback
    let initial: EventItem[] = [];
    if (fromBlob) {
      initial = fromBlob;
    } else if (localEvents?.events && Array.isArray(localEvents.events)) {
      // Add IDs to events that don't have them
      initial = localEvents.events.map((event: any, index: number) => ({
        id: event.id || `event-${index + 1}`,
        ...event
      })) as EventItem[];
    } else if (Array.isArray(seed)) {
      initial = seed as EventItem[];
    }
    memoryStore = initial.filter(isEventItem).slice().sort(sortByDateAsc);
  }
}

async function persistToBlob(data: EventItem[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return; // skip if not configured
  const pathname = BLOB_PATH.startsWith('/') ? BLOB_PATH.slice(1) : BLOB_PATH; // Remove leading slash if present
  const body = JSON.stringify(data, null, 2);
  await put(pathname, new Blob([body], { type: "application/json" }), {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    allowOverwrite: true, // Allow overwriting existing events.json blob
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
      // Insert with proper UUID (after migration, all IDs should be valid UUIDs)
      await sql`insert into events (id, name, date, time, planner, image, tickets_url, description)
                values (${e.id}::uuid, ${e.name}, ${e.date}, ${e.time}, ${e.planner}, ${e.image}, ${e.ticketsUrl ?? null}, ${e.description ?? null})`;
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
    return memoryStore!
      .map(event => ({
        ...event,
        image: convertImageUrl(event.image)
      }))
      .slice()
      .sort(sortByDateAsc);
  },
  async listFresh() {
    // Always fetch fresh data from database, bypass memory cache
    if (POSTGRES_URL) {
      try {
        const sql = neon(POSTGRES_URL);
        const rows = await sql`select id::text, name, date, time, planner, image, tickets_url as "ticketsUrl", description from events order by date desc, time desc` as EventItem[];
        const fresh = rows
          .filter(isEventItem)
          .map(event => ({
            ...event,
            image: convertImageUrl(event.image)
          }))
          .sort(sortByDateAsc);
        // Update memory cache with fresh data
        memoryStore = fresh;
        return fresh;
      } catch (e) {
        console.error('Fresh fetch failed, falling back to cached data:', e);
        // Fall back to cached data if DB fetch fails
        await ensureSeeded();
        return memoryStore!
          .map(event => ({
            ...event,
            image: convertImageUrl(event.image)
          }))
          .slice()
          .sort(sortByDateAsc);
      }
    }
    // If no Postgres, fall back to regular list method
    return this.list();
  },
  async get(id) {
    await ensureSeeded();
    const event = memoryStore!.find((e) => e.id === id);
    if (event) {
      return {
        ...event,
        image: convertImageUrl(event.image)
      };
    }
    return event;
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

