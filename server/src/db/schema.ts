
import { serial, text, pgTable, timestamp, boolean, integer, json, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for component types
export const componentTypeEnum = pgEnum('component_type', ['chart', 'table', 'metric', 'text']);

// Dashboards table
export const dashboardsTable = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Dashboard components table for future extensibility
export const dashboardComponentsTable = pgTable('dashboard_components', {
  id: serial('id').primaryKey(),
  dashboard_id: integer('dashboard_id').notNull().references(() => dashboardsTable.id, { onDelete: 'cascade' }),
  component_type: componentTypeEnum('component_type').notNull(),
  title: text('title').notNull(),
  config: json('config'), // JSON configuration for component, nullable by default
  position_x: integer('position_x').notNull().default(0),
  position_y: integer('position_y').notNull().default(0),
  width: integer('width').notNull().default(4),
  height: integer('height').notNull().default(3),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const dashboardsRelations = relations(dashboardsTable, ({ many }) => ({
  components: many(dashboardComponentsTable),
}));

export const dashboardComponentsRelations = relations(dashboardComponentsTable, ({ one }) => ({
  dashboard: one(dashboardsTable, {
    fields: [dashboardComponentsTable.dashboard_id],
    references: [dashboardsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Dashboard = typeof dashboardsTable.$inferSelect;
export type NewDashboard = typeof dashboardsTable.$inferInsert;
export type DashboardComponent = typeof dashboardComponentsTable.$inferSelect;
export type NewDashboardComponent = typeof dashboardComponentsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  dashboards: dashboardsTable, 
  dashboardComponents: dashboardComponentsTable 
};
