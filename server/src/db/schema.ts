
import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define theme enum for PostgreSQL
export const themeEnum = pgEnum('theme', ['light', 'dark']);

// User preferences table for theme and other UI preferences
export const userPreferencesTable = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().unique(), // Unique constraint for one preference per user
  theme: themeEnum('theme').notNull().default('light'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type UserPreferences = typeof userPreferencesTable.$inferSelect;
export type NewUserPreferences = typeof userPreferencesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  userPreferences: userPreferencesTable 
};
