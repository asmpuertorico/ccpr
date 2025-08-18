#!/usr/bin/env node

/**
 * Migration script to move local images to Vercel Blob storage
 * 
 * This script will:
 * 1. Read all events from the current storage
 * 2. Find events with local image paths (/images/events/...)
 * 3. Upload those images to Vercel Blob
 * 4. Update the events with the new blob URLs
 * 5. Optionally clean up local files after successful migration
 * 
 * Usage:
 *   node scripts/migrate-images-to-blob.js [--dry-run] [--cleanup]
 * 
 * Options:
 *   --dry-run    Show what would be migrated without making changes
 *   --cleanup    Delete local files after successful migration
 */

const fs = require('fs').promises;
const path = require('path');
const { put } = require('@vercel/blob');

// Configuration  
const LOCAL_IMAGES_DIR = path.join(__dirname, '..', '..', 'public', 'images', 'events');
const EVENTS_FILE = path.join(__dirname, '..', '..', 'public', 'events-2025-local.json');
const DRY_RUN = process.argv.includes('--dry-run');
const CLEANUP = process.argv.includes('--cleanup');

console.log('🚀 Image Migration Script');
console.log('========================');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE MIGRATION'}`);
console.log(`Cleanup: ${CLEANUP ? 'Enabled (local files will be deleted)' : 'Disabled'}`);
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

async function uploadImageToBlob(localPath, fileName) {
  if (DRY_RUN) {
    console.log(`📝 [DRY RUN] Would upload ${fileName} to blob storage`);
    return `https://example.blob.vercel-storage.com/events/${fileName}`;
  }

  try {
    // Read the local file
    const fileBuffer = await fs.readFile(localPath);
    
    // Upload to Vercel Blob
    const blob = await put(`events/${fileName}`, fileBuffer, {
      access: 'public',
      contentType: getContentType(fileName),
      allowOverwrite: true, // Allow overwriting during migration
    });

    console.log(`✅ Uploaded ${fileName} -> ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message);
    throw error;
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

async function deleteLocalFile(filePath) {
  if (DRY_RUN) {
    console.log(`📝 [DRY RUN] Would delete local file: ${filePath}`);
    return;
  }

  if (!CLEANUP) {
    console.log(`⏭️  Skipping deletion of ${path.basename(filePath)} (cleanup disabled)`);
    return;
  }

  try {
    await fs.unlink(filePath);
    console.log(`🗑️  Deleted local file: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`⚠️  Failed to delete ${path.basename(filePath)}:`, error.message);
  }
}

async function main() {
  try {
    // Load events
    console.log('📖 Loading events...');
    const events = await loadEvents();
    console.log(`Found ${events.length} events`);

    // Find events with local images
    const eventsWithLocalImages = events.filter(event => 
      event.image && event.image.startsWith('/images/events/')
    );

    console.log(`📸 Found ${eventsWithLocalImages.length} events with local images`);

    if (eventsWithLocalImages.length === 0) {
      console.log('✅ No local images to migrate!');
      return;
    }

    // Process each event
    let successCount = 0;
    let errorCount = 0;
    const migratedFiles = [];

    for (const event of eventsWithLocalImages) {
      try {
        console.log(`\n🔄 Processing: ${event.name}`);
        
        // Extract filename from path
        const fileName = path.basename(event.image);
        const localPath = path.join(LOCAL_IMAGES_DIR, fileName);
        
        // Check if local file exists
        try {
          await fs.access(localPath);
        } catch {
          console.log(`⚠️  Local file not found: ${fileName} (skipping)`);
          continue;
        }

        // Upload to blob
        const blobUrl = await uploadImageToBlob(localPath, fileName);
        
        // Update event
        event.image = blobUrl;
        successCount++;
        
        // Track for cleanup
        migratedFiles.push(localPath);
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${event.name}:`, error.message);
        errorCount++;
      }
    }

    // Save updated events
    if (successCount > 0) {
      await saveEvents(events);
    }

    // Cleanup local files
    if (successCount > 0 && CLEANUP) {
      console.log('\n🧹 Cleaning up local files...');
      for (const filePath of migratedFiles) {
        await deleteLocalFile(filePath);
      }
    }

    // Summary
    console.log('\n📊 Migration Summary');
    console.log('===================');
    console.log(`✅ Successfully migrated: ${successCount} images`);
    console.log(`❌ Failed: ${errorCount} images`);
    console.log(`🗑️  Local files deleted: ${CLEANUP && !DRY_RUN ? migratedFiles.length : 0}`);
    
    if (DRY_RUN) {
      console.log('\n💡 This was a dry run. To perform the actual migration, run:');
      console.log('   node scripts/migrate-images-to-blob.js');
      console.log('\n💡 To also delete local files after migration, run:');
      console.log('   node scripts/migrate-images-to-blob.js --cleanup');
    } else if (successCount > 0) {
      console.log('\n✅ Migration completed successfully!');
      if (!CLEANUP) {
        console.log('💡 Local files were preserved. Run with --cleanup to remove them.');
      }
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Check environment
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is required');
  console.log('💡 Set up your Vercel Blob token in .env.local:');
  console.log('   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...');
  process.exit(1);
}

// Run the migration
main().catch(console.error);
