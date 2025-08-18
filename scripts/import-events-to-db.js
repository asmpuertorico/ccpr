#!/usr/bin/env node

/**
 * Import events from local JSON file to database
 * This script imports the migrated events (with blob URLs) into the database
 */

const fs = require('fs').promises;
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const EVENTS_FILE = path.join(__dirname, '..', 'public', 'events-2025-local.json');
const POSTGRES_URL = process.env.POSTGRES_URL;

async function main() {
  console.log('🚀 Events Database Import Script');
  console.log('================================');

  if (!POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is required');
    process.exit(1);
  }

  try {
    // Load events from JSON
    console.log('📖 Loading events from JSON file...');
    const data = await fs.readFile(EVENTS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    const events = parsed.events || parsed;
    
    console.log(`Found ${events.length} events to import`);

    // Connect to database
    console.log('🔌 Connecting to database...');
    const sql = neon(POSTGRES_URL);

    // Clear existing events
    console.log('🧹 Clearing existing events...');
    await sql`DELETE FROM events`;

    // Import events
    console.log('📥 Importing events...');
    let imported = 0;
    
    for (const event of events) {
      try {
        await sql`
          INSERT INTO events (
            name, date, time, planner, image, tickets_url, description
          ) VALUES (
            ${event.name},
            ${event.date},
            ${event.time},
            ${event.planner},
            ${event.image},
            ${event.ticketsUrl || null},
            ${event.description || null}
          )
        `;
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`  ✅ Imported ${imported}/${events.length} events`);
        }
      } catch (error) {
        console.error(`❌ Failed to import event "${event.name}":`, error.message);
      }
    }

    console.log(`\n📊 Import Summary`);
    console.log(`=================`);
    console.log(`✅ Successfully imported: ${imported} events`);
    console.log(`❌ Failed: ${events.length - imported} events`);
    
    if (imported > 0) {
      console.log('\n✅ Database import completed successfully!');
      console.log('🔄 Restart your application to see the migrated images');
    }

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
