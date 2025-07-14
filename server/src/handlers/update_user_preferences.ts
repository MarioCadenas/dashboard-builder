
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type UpdateUserPreferencesInput, type UserPreferences } from '../schema';
import { eq } from 'drizzle-orm';

export const updateUserPreferences = async (input: UpdateUserPreferencesInput): Promise<UserPreferences> => {
  try {
    // Update existing user preferences
    const result = await db.update(userPreferencesTable)
      .set({
        theme: input.theme,
        updated_at: new Date()
      })
      .where(eq(userPreferencesTable.user_id, input.user_id))
      .returning()
      .execute();

    // If no rows were updated, the user preferences don't exist
    if (result.length === 0) {
      throw new Error(`User preferences not found for user_id: ${input.user_id}`);
    }

    return result[0];
  } catch (error) {
    console.error('User preferences update failed:', error);
    throw error;
  }
};
