const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');

// Configuration
const EVENTS_FILE = path.join(__dirname, '..', 'public', 'events-2025-local.json');
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Event ID Migration Script');
console.log('============================');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE MIGRATION'}`);
console.log('');

async function loadEvents() {
  try {
    const data = await fs.readFile(EVENTS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.events || parsed; // Handle both {events: [...]} and [...] formats
  } catch (error) {
    console.error('❌ Failed to load events file:', error.message);
    process.exit(1);
  }
}

async function saveEvents(events) {
  if (DRY_RUN) {
    console.log('📝 [DRY RUN] Would save updated events file');
    return;
  }

  try {
    const eventsData = { events }; // Wrap in events object to match original format
    await fs.writeFile(EVENTS_FILE, JSON.stringify(eventsData, null, 2));
    console.log('✅ Events file updated successfully');
  } catch (error) {
    console.error('❌ Failed to save events file:', error.message);
    throw error;
  }
}

function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function main() {
  console.log('📖 Loading events...');
  const events = await loadEvents();
  console.log(`Found ${events.length} events`);

  let migratedCount = 0;
  const updatedEvents = [];
  const idMapping = new Map(); // Track old ID -> new UUID mapping

  console.log('🔍 Checking event IDs...');
  
  for (const event of events) {
    if (!isValidUUID(event.id)) {
      console.log(`🔄 Converting ID: "${event.id}" -> UUID`);
      const newId = randomUUID();
      idMapping.set(event.id, newId);
      
      updatedEvents.push({
        ...event,
        id: newId
      });
      migratedCount++;
    } else {
      console.log(`✅ Valid UUID: ${event.id}`);
      updatedEvents.push(event);
    }
  }

  if (migratedCount > 0) {
    console.log('\n📋 ID Migration Summary:');
    console.log('========================');
    for (const [oldId, newId] of idMapping) {
      console.log(`  ${oldId} -> ${newId}`);
    }
    
    await saveEvents(updatedEvents);
  } else {
    console.log('✅ All event IDs are already valid UUIDs - no migration needed');
  }

  console.log('\n📊 Final Summary');
  console.log('================');
  console.log(`✅ Events migrated: ${migratedCount}`);
  console.log(`✅ Events unchanged: ${events.length - migratedCount}`);
  console.log(`✅ Total events: ${events.length}`);

  if (migratedCount > 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('💡 You may need to restart your development server to pick up the changes.');
  }
}

main().catch(console.error);

