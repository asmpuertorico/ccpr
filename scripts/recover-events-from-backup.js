#!/usr/bin/env node

/**
 * Recovery script to restore events from JSON backup file
 * This will restore events from public/events-2025.json to the database
 */

const fs = require('fs').promises;
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// Load environment variables
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      console.log(`📄 Loaded environment variables from ${envFile}`);
      return true;
    }
  }
  return false;
}

loadEnvFile();

const POSTGRES_URL = process.env.POSTGRES_URL;
const EVENTS_FILE = path.join(__dirname, '..', 'public', 'events-2025.json');

async function main() {
  console.log('🚨 Event Recovery Script');
  console.log('========================');
  console.log('⚠️  WARNING: This will restore events from backup file');
  console.log('');

  if (!POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is required');
    process.exit(1);
  }

  try {
    // Load events from backup
    console.log('📖 Loading events from backup file...');
    const data = await fs.readFile(EVENTS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    const events = parsed.events || parsed;
    
    if (!Array.isArray(events) || events.length === 0) {
      console.error('❌ No events found in backup file');
      process.exit(1);
    }

    console.log(`✅ Found ${events.length} events in backup`);

    // Connect to database
    console.log('🔌 Connecting to database...');
    const sql = neon(POSTGRES_URL);

    // Check current event count
    const currentCount = await sql`SELECT COUNT(*) as count FROM events`;
    console.log(`📊 Current events in database: ${currentCount[0].count}`);

    // Ask for confirmation (in a real scenario, you'd want user input)
    console.log('\n⚠️  This will INSERT events into the database.');
    console.log('   Existing events will NOT be deleted.');
    console.log('   Duplicate events (by ID) will be skipped.\n');

    // Generate UUIDs for events that don't have IDs
    const { randomUUID } = require('crypto');
    let restored = 0;
    let skipped = 0;
    let errors = 0;

    console.log('📥 Restoring events...\n');

    for (const event of events) {
      try {
        // Generate ID if missing
        const eventId = event.id || randomUUID();
        
        // Check if event already exists
        const existing = await sql`
          SELECT id FROM events WHERE id = ${eventId}::uuid
        `;

        if (existing.length > 0) {
          console.log(`⏭️  Skipping ${event.name} (already exists)`);
          skipped++;
          continue;
        }

        // Insert event with proper schema (including new end_date/end_time columns)
        await sql`
          INSERT INTO events (
            id, name, date, time, end_date, end_time, planner, image, tickets_url, description
          ) VALUES (
            ${eventId}::uuid,
            ${event.name || 'Untitled Event'},
            ${event.date},
            ${event.time || null},
            ${event.endDate || null},
            ${event.endTime || null},
            ${event.planner || 'Unknown'},
            ${event.image || event.imageOriginal || null},
            ${event.ticketsUrl || null},
            ${event.description || null}
          )
          ON CONFLICT (id) DO NOTHING
        `;

        restored++;
        if (restored % 10 === 0) {
          console.log(`  ✅ Restored ${restored}/${events.length} events...`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to restore "${event.name}":`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Recovery Summary');
    console.log('===================');
    console.log(`✅ Successfully restored: ${restored} events`);
    console.log(`⏭️  Skipped (already exist): ${skipped} events`);
    console.log(`❌ Errors: ${errors} events`);
    
    const finalCount = await sql`SELECT COUNT(*) as count FROM events`;
    console.log(`\n📊 Total events in database now: ${finalCount[0].count}`);

  } catch (error) {
    console.error('\n❌ Recovery failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

