
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { deleteDashboard } from '../handlers/delete_dashboard';

describe('deleteDashboard', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create a mock dashboards table for testing
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dashboards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create a mock dashboard_components table to test cascading
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dashboard_components (
        id SERIAL PRIMARY KEY,
        dashboard_id INTEGER REFERENCES dashboards(id) ON DELETE CASCADE,
        component_type TEXT NOT NULL,
        config JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  });
  
  afterEach(resetDB);

  it('should delete existing dashboard and return true', async () => {
    // Create test dashboard
    const dashboardResult = await db.execute(sql`
      INSERT INTO dashboards (name, user_id) 
      VALUES ('Test Dashboard', 'user123') 
      RETURNING id
    `);
    
    const dashboardId = dashboardResult.rows[0]['id'] as number;
    
    // Delete the dashboard
    const result = await deleteDashboard(dashboardId);
    
    expect(result).toBe(true);
    
    // Verify dashboard was deleted
    const checkResult = await db.execute(sql`
      SELECT * FROM dashboards WHERE id = ${dashboardId}
    `);
    
    expect(checkResult.rows).toHaveLength(0);
  });

  it('should return false when dashboard does not exist', async () => {
    const result = await deleteDashboard(999);
    
    expect(result).toBe(false);
  });

  it('should cascade delete related dashboard components', async () => {
    // Create test dashboard
    const dashboardResult = await db.execute(sql`
      INSERT INTO dashboards (name, user_id) 
      VALUES ('Test Dashboard', 'user123') 
      RETURNING id
    `);
    
    const dashboardId = dashboardResult.rows[0]['id'] as number;
    
    // Create related components
    await db.execute(sql`
      INSERT INTO dashboard_components (dashboard_id, component_type, config)
      VALUES 
        (${dashboardId}, 'chart', '{"type": "bar"}'),
        (${dashboardId}, 'table', '{"columns": ["name", "value"]}')
    `);
    
    // Verify components exist before deletion
    const componentsBeforeResult = await db.execute(sql`
      SELECT * FROM dashboard_components WHERE dashboard_id = ${dashboardId}
    `);
    
    expect(componentsBeforeResult.rows).toHaveLength(2);
    
    // Delete the dashboard
    const result = await deleteDashboard(dashboardId);
    
    expect(result).toBe(true);
    
    // Verify components were cascade deleted
    const componentsAfterResult = await db.execute(sql`
      SELECT * FROM dashboard_components WHERE dashboard_id = ${dashboardId}
    `);
    
    expect(componentsAfterResult.rows).toHaveLength(0);
  });

  it('should handle multiple dashboard deletions correctly', async () => {
    // Create multiple test dashboards
    const dashboard1Result = await db.execute(sql`
      INSERT INTO dashboards (name, user_id) 
      VALUES ('Dashboard 1', 'user123') 
      RETURNING id
    `);
    
    const dashboard2Result = await db.execute(sql`
      INSERT INTO dashboards (name, user_id) 
      VALUES ('Dashboard 2', 'user123') 
      RETURNING id
    `);
    
    const dashboard1Id = dashboard1Result.rows[0]['id'] as number;
    const dashboard2Id = dashboard2Result.rows[0]['id'] as number;
    
    // Delete first dashboard
    const result1 = await deleteDashboard(dashboard1Id);
    expect(result1).toBe(true);
    
    // Delete second dashboard
    const result2 = await deleteDashboard(dashboard2Id);
    expect(result2).toBe(true);
    
    // Verify both dashboards were deleted
    const checkResult = await db.execute(sql`
      SELECT * FROM dashboards WHERE id IN (${dashboard1Id}, ${dashboard2Id})
    `);
    
    expect(checkResult.rows).toHaveLength(0);
  });
});
