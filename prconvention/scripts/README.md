# Image Migration Script

This directory contains scripts for migrating and managing event images.

## migrate-images-to-blob.js

Migrates local event images from `public/images/events/` to Vercel Blob storage.

### Usage

**Dry run (preview what will be migrated):**
```bash
npm run migrate-images:dry-run
```

**Migrate images:**
```bash
npm run migrate-images
```

**Migrate and cleanup local files:**
```bash
npm run migrate-images:cleanup
```

### Requirements

- `BLOB_READ_WRITE_TOKEN` environment variable must be set
- Local images must be in `public/images/events/` directory
- Events data in `public/events-2025.json`

### What it does

1. Reads all events from the JSON file
2. Finds events with local image paths (`/images/events/...`)
3. Uploads those images to Vercel Blob storage
4. Updates the events with new blob URLs
5. Optionally cleans up local files after successful migration

### Safety Features

- **Dry run mode**: Preview changes without making them
- **Backup preservation**: Local files are kept unless `--cleanup` is used
- **Error handling**: Failed uploads don't prevent other images from being processed
- **Progress reporting**: Detailed console output shows what's happening

### Example Output

```
🚀 Image Migration Script
========================
Mode: LIVE MIGRATION
Cleanup: Enabled (local files will be deleted)

📖 Loading events...
Found 150 events
📸 Found 45 events with local images

🔄 Processing: Annual Tech Conference
✅ Uploaded tech-conference-2025.jpg -> https://blob.vercel-storage.com/...

📊 Migration Summary
===================
✅ Successfully migrated: 45 images
❌ Failed: 0 images
🗑️  Local files deleted: 45

✅ Migration completed successfully!
```

