import { neon } from "@neondatabase/serverless";

const POSTGRES_URL = process.env.POSTGRES_URL;

async function getSql() {
  if (!POSTGRES_URL) throw new Error("POSTGRES_URL not set");
  const sql = neon(POSTGRES_URL);
  await sql`create table if not exists assets (
    id uuid primary key default gen_random_uuid(),
    original_url text unique,
    local_path text,
    created_at timestamptz not null default now()
  )`;
  return sql;
}

export async function findAssetByOriginal(originalUrl: string): Promise<{ id: string; local_path: string } | null> {
  const sql = await getSql();
  const rows = await sql<{ id: string; local_path: string }[]>`select id::text, local_path from assets where original_url = ${originalUrl}`;
  return rows[0] || null;
}

export async function saveAsset(originalUrl: string, localPath: string): Promise<{ id: string }> {
  const sql = await getSql();
  const rows = await sql<{ id: string }[]>`insert into assets (original_url, local_path) values (${originalUrl}, ${localPath})
    on conflict (original_url) do update set local_path = excluded.local_path returning id::text`;
  return rows[0];
}



