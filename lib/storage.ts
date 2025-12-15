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
        // Try to fetch with new columns first, fall back to old schema if columns don't exist
        let rows: EventItem[];
        try {
          rows = await sql`select id::text, name, date, time, end_date as "endDate", end_time as "endTime", planner, image, tickets_url as "ticketsUrl", description from events order by date desc, time desc` as EventItem[];
        } catch (columnError: any) {
          // If end_date/end_time columns don't exist, use old schema
          if (columnError?.code === '42703' || columnError?.message?.includes('does not exist')) {
            console.log('⚠️ New columns not found during seed, using old schema (without end_date/end_time)');
            rows = await sql`select id::text, name, date, time, planner, image, tickets_url as "ticketsUrl", description from events order by date desc, time desc` as EventItem[];
            // Add undefined for missing fields
            rows = rows.map(event => ({ ...event, endDate: undefined, endTime: undefined })) as EventItem[];
          } else {
            throw columnError;
          }
        }
        console.log(`📊 Seeded ${rows.length} events from database`);
        memoryStore = rows
          .filter(isEventItem)
          .map(event => ({
            ...event,
            // Convert null to undefined for optional fields
            time: event.time ?? undefined,
            endDate: event.endDate ?? undefined,
            endTime: event.endTime ?? undefined,
            image: convertImageUrl(event.image)
          }))
          .sort(sortByDateAsc);
        console.log(`✅ Processed ${memoryStore.length} valid events`);
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
    // Check if new columns exist
    let hasNewColumns = false;
    try {
      await sql`select end_date, end_time from events limit 1`;
      hasNewColumns = true;
      console.log('✅ Database has end_date and end_time columns');
    } catch {
      hasNewColumns = false;
      console.log('⚠️ Database does not have end_date and end_time columns, using old schema');
    }
    
    await sql`truncate table events`;
    for (const e of data) {
      if (hasNewColumns) {
        // Insert with new columns
        await sql`insert into events (id, name, date, time, end_date, end_time, planner, image, tickets_url, description)
                  values (${e.id}::uuid, ${e.name}, ${e.date}, ${e.time ?? null}, ${e.endDate ?? null}, ${e.endTime ?? null}, ${e.planner}, ${e.image}, ${e.ticketsUrl ?? null}, ${e.description ?? null})`;
      } else {
        // Insert without new columns (backward compatibility)
        await sql`insert into events (id, name, date, time, planner, image, tickets_url, description)
                  values (${e.id}::uuid, ${e.name}, ${e.date}, ${e.time ?? null}, ${e.planner}, ${e.image}, ${e.ticketsUrl ?? null}, ${e.description ?? null})`;
      }
    }
    await sql`commit`;
    console.log(`✅ Persisted ${data.length} events to database`);
  } catch (err) {
    await sql`rollback`;
    console.error('❌ Failed to persist events to database:', err);
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
        // Try to fetch with new columns first, fall back to old schema if columns don't exist
        let rows: EventItem[];
        try {
          rows = await sql`select id::text, name, date, time, end_date as "endDate", end_time as "endTime", planner, image, tickets_url as "ticketsUrl", description from events order by date desc, time desc` as EventItem[];
        } catch (columnError: any) {
          // If end_date/end_time columns don't exist, use old schema
          if (columnError?.code === '42703' || columnError?.message?.includes('does not exist')) {
            console.log('⚠️ New columns not found, using old schema (without end_date/end_time)');
            rows = await sql`select id::text, name, date, time, planner, image, tickets_url as "ticketsUrl", description from events order by date desc, time desc` as EventItem[];
            // Add undefined for missing fields
            rows = rows.map(event => ({ ...event, endDate: undefined, endTime: undefined })) as EventItem[];
          } else {
            throw columnError;
          }
        }
        console.log(`📊 Fetched ${rows.length} events from database`);
        const fresh = rows
          .filter(isEventItem)
          .map(event => ({
            ...event,
            // Convert null to undefined for optional fields
            time: event.time ?? undefined,
            endDate: event.endDate ?? undefined,
            endTime: event.endTime ?? undefined,
            image: convertImageUrl(event.image)
          }))
          .sort(sortByDateAsc);
        console.log(`✅ Processed ${fresh.length} valid events`);
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
    let event = memoryStore!.find((e) => e.id === id);
    
    // If not found in memory cache, try fetching directly from database
    if (!event && POSTGRES_URL) {
      try {
        const sql = neon(POSTGRES_URL);
        let rows: EventItem[];
        try {
          // Try with new columns first
          rows = await sql`
            select id::text, name, date, time, end_date as "endDate", end_time as "endTime", planner, image, tickets_url as "ticketsUrl", description 
            from events 
            where id = ${id}::uuid and (is_deleted is null or is_deleted = false)
            limit 1
          ` as EventItem[];
        } catch (columnError: any) {
          // Fall back to old schema if columns don't exist
          if (columnError?.code === '42703' || columnError?.message?.includes('does not exist')) {
            rows = await sql`
              select id::text, name, date, time, planner, image, tickets_url as "ticketsUrl", description 
              from events 
              where id = ${id}::uuid and (is_deleted is null or is_deleted = false)
              limit 1
            ` as EventItem[];
            rows = rows.map(e => ({ ...e, endDate: undefined, endTime: undefined })) as EventItem[];
          } else {
            throw columnError;
          }
        }
        
        if (rows.length > 0) {
          event = rows[0];
          // Update memory cache with the fetched event
          const existingIndex = memoryStore!.findIndex((e) => e.id === id);
          if (existingIndex >= 0) {
            memoryStore![existingIndex] = event;
          } else {
            memoryStore!.push(event);
            memoryStore = memoryStore!.sort(sortByDateAsc);
          }
        }
      } catch (error) {
        console.error('Failed to fetch event from database:', error);
        // Continue with undefined if database fetch fails
      }
    }
    
    if (event) {
      return {
        ...event,
        // Convert null to undefined for optional fields
        time: event.time ?? undefined,
        endDate: event.endDate ?? undefined,
        endTime: event.endTime ?? undefined,
        image: convertImageUrl(event.image)
      };
    }
    return undefined;
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

// Enhanced event type with all database fields
export type EnhancedEvent = {
  id: string;
  name: string;
  date: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  planner: string;
  image: string;
  ticketsUrl?: string;
  description?: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;
  updatedBy: string;
  version: number;
  isDeleted: boolean;
  deletedAt?: Date | string | null;
  deletedBy?: string | null;
};

// Fetch all events with full database fields (for LLM endpoint)
export async function getAllEventsWithFullData(): Promise<EnhancedEvent[]> {
  if (POSTGRES_URL) {
    try {
      const sql = neon(POSTGRES_URL);
      // Try to fetch with new columns first, fall back to old schema if columns don't exist
      let rows: EnhancedEvent[];
      try {
        rows = await sql`
          select 
            id::text,
            name,
            date,
            time,
            end_date as "endDate",
            end_time as "endTime",
            planner,
            image,
            tickets_url as "ticketsUrl",
            description,
            status,
            created_at as "createdAt",
            updated_at as "updatedAt",
            created_by as "createdBy",
            updated_by as "updatedBy",
            version,
            is_deleted as "isDeleted",
            deleted_at as "deletedAt",
            deleted_by as "deletedBy"
          from events
          where is_deleted = false and status = 'published'
          order by date asc, time asc
        ` as EnhancedEvent[];
      } catch (columnError: any) {
        // If end_date/end_time columns don't exist, use old schema
        if (columnError?.code === '42703' || columnError?.message?.includes('does not exist')) {
          console.log('⚠️ New columns not found in getAllEventsWithFullData, using old schema');
          rows = await sql`
            select 
              id::text,
              name,
              date,
              time,
              planner,
              image,
              tickets_url as "ticketsUrl",
              description,
              status,
              created_at as "createdAt",
              updated_at as "updatedAt",
              created_by as "createdBy",
              updated_by as "updatedBy",
              version,
              is_deleted as "isDeleted",
              deleted_at as "deletedAt",
              deleted_by as "deletedBy"
            from events
            where is_deleted = false and status = 'published'
            order by date asc, time asc
          ` as EnhancedEvent[];
          // Add undefined for missing fields
          rows = rows.map(event => ({ ...event, endDate: undefined, endTime: undefined })) as EnhancedEvent[];
        } else {
          throw columnError;
        }
      }
      
      return rows.map(event => ({
        ...event,
        image: convertImageUrl(event.image || ''),
        createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
        updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt,
        deletedAt: event.deletedAt instanceof Date ? event.deletedAt.toISOString() : (event.deletedAt || null),
      }));
    } catch (e) {
      console.error('Failed to fetch full event data from database:', e);
      // Fall back to basic event data
      const basicEvents = await inMemoryProvider.listFresh();
      return basicEvents.map(event => ({
        ...event,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      }));
    }
  }
  
  // Fall back to basic event data if no database
  const basicEvents = await inMemoryProvider.listFresh();
  return basicEvents.map(event => ({
    ...event,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    updatedBy: 'system',
    version: 1,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  }));
}

