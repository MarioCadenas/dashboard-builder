
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type GetUserPreferencesInput, type UserPreferences } from '../schema';
import { eq } from 'drizzle-orm';

export const getUserPreferences = async (input: GetUserPreferencesInput): Promise<UserPreferences | null> => {
  try {
    // Query user preferences by user_id
    const result = await db.select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.user_id, input.user_id))
      .execute();

    // Return null if no preferences found (first-time user)
    if (result.length === 0) {
      return null;
    }

    // Return the first (and only) result due to unique constraint
    return result[0];
  } catch (error) {
    console.error('Get user preferences failed:', error);
    throw error;
  }
};
