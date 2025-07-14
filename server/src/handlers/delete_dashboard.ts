
import { db } from '../db';
import { sql } from 'drizzle-orm';

export const deleteDashboard = async (id: number): Promise<boolean> => {
  try {
    // Since dashboard schema is not defined, we'll use raw SQL
    // This would cascade delete all related dashboard components
    const result = await db.execute(
      sql`DELETE FROM dashboards WHERE id = ${id}`
    );
    
    // Check if any rows were affected (dashboard existed and was deleted)
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Dashboard deletion failed:', error);
    throw error;
  }
};
