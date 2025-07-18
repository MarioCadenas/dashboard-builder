
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type UpdateUserPreferencesInput, type UserPreferences } from '../schema';
import { eq } from 'drizzle-orm';

export const updateDashboard = async (input: UpdateUserPreferencesInput): Promise<UserPreferences | null> => {
  try {
    // Update user preferences (theme for dashboard)
    const result = await db.update(userPreferencesTable)
      .set({
        theme: input.theme,
        updated_at: new Date()
      })
      .where(eq(userPreferencesTable.user_id, input.user_id))
      .returning()
      .execute();

    // Return null if no record was found and updated
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Dashboard preferences update failed:', error);
    throw error;
  }
};
