import { pgTable, text, timestamp, uuid, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

// Events table with audit fields
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  planner: text('planner').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD format
  time: text('time'), // HH:MM format (optional)
  endDate: text('end_date'), // YYYY-MM-DD format (optional, for multi-day events)
  endTime: text('end_time'), // HH:MM format (optional, for multi-day events)
  image: text('image'),
  ticketsUrl: text('tickets_url'),
  description: text('description'),
  status: text('status').notNull().default('published'), // published, draft, archived
  
  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: text('created_by').notNull().default('admin'),
  updatedBy: text('updated_by').notNull().default('admin'),
  version: integer('version').notNull().default(1),
  isDeleted: boolean('is_deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  deletedBy: text('deleted_by'),
});

// Audit log table for tracking all changes
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  action: text('action').notNull(), // CREATE, UPDATE, DELETE, RESTORE
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  changedFields: text('changed_fields').array(),
  
  // Metadata
  userId: text('user_id').notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  
  // Additional context
  reason: text('reason'), // Optional reason for the change
  metadata: jsonb('metadata'), // Additional context data
});

// User sessions table (for JWT blacklisting and session management)
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  tokenId: text('token_id').notNull().unique(), // JTI claim from JWT
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').notNull().default(false),
  revokedAt: timestamp('revoked_at'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

// System settings table
export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: text('updated_by').notNull(),
});

// Sales reps table for digital business card / QR profile feature
export const salesReps = pgTable('sales_reps', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  title: text('title').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  mobile: text('mobile'),
  image: text('image'),
  bio: text('bio'),
  region: text('region'),
  linkedin: text('linkedin'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type SalesRep = typeof salesReps.$inferSelect;
export type NewSalesRep = typeof salesReps.$inferInsert;

