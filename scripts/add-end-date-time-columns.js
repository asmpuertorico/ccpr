#!/usr/bin/env node

/**
 * Migration script to add end_date and end_time columns to events table
 * Also makes time column nullable (optional)
 */

const { neon } = require('@neondatabase/serverless');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local or .env files
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

// Try to load .env files
loadEnvFile();

const POSTGRES_URL = process.env.POSTGRES_URL;

async function main() {
  console.log('🚀 Database Migration: Add end_date and end_time columns');
  console.log('==========================================================');

  if (!POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🔌 Connecting to database...');
    const sql = neon(POSTGRES_URL);

    // Check if columns already exist
    console.log('📋 Checking current schema...');
    const checkColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('end_date', 'end_time')
    `;

    const existingColumns = checkColumns.map(row => row.column_name);
    
    // Make time column nullable if it isn't already
    console.log('🔧 Making time column nullable...');
    try {
      await sql`ALTER TABLE events ALTER COLUMN time DROP NOT NULL`;
      console.log('  ✅ time column is now nullable');
    } catch (error) {
      if (error.message.includes('does not exist') || error.message.includes('already')) {
        console.log('  ℹ️  time column is already nullable or does not exist');
      } else {
        throw error;
      }
    }

    // Add end_date column if it doesn't exist
    if (!existingColumns.includes('end_date')) {
      console.log('➕ Adding end_date column...');
      await sql`ALTER TABLE events ADD COLUMN end_date TEXT`;
      console.log('  ✅ end_date column added');
    } else {
      console.log('  ℹ️  end_date column already exists');
    }

    // Add end_time column if it doesn't exist
    if (!existingColumns.includes('end_time')) {
      console.log('➕ Adding end_time column...');
      await sql`ALTER TABLE events ADD COLUMN end_time TEXT`;
      console.log('  ✅ end_time column added');
    } else {
      console.log('  ℹ️  end_time column already exists');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - time column: nullable (optional)');
    console.log('  - end_date column: added');
    console.log('  - end_time column: added');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

