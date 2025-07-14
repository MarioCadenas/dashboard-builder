
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type UserPreferences } from '../schema';

export const getDashboards = async (): Promise<UserPreferences[]> => {
  try {
    // Since Dashboard type is not defined in schema, returning user preferences
    // This appears to be a placeholder - in a real implementation, this would
    // fetch from a dashboards table ordered by creation date
    const result = await db.select()
      .from(userPreferencesTable)
      .orderBy(userPreferencesTable.created_at)
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch dashboards:', error);
    throw error;
  }
};
