
import { db } from '../db';
import { userPreferencesTable } from '../db/schema';
import { type UpdateUserPreferencesInput, type ThemeResponse } from '../schema';
import { eq } from 'drizzle-orm';

export const upsertUserTheme = async (input: UpdateUserPreferencesInput): Promise<ThemeResponse> => {
  try {
    // Use PostgreSQL's ON CONFLICT to handle upsert operation
    const result = await db
      .insert(userPreferencesTable)
      .values({
        user_id: input.user_id,
        theme: input.theme,
        updated_at: new Date()
      })
      .onConflictDoUpdate({
        target: userPreferencesTable.user_id,
        set: {
          theme: input.theme,
          updated_at: new Date()
        }
      })
      .returning({
        theme: userPreferencesTable.theme,
        updated_at: userPreferencesTable.updated_at
      })
      .execute();

    return {
      theme: result[0].theme,
      updated_at: result[0].updated_at
    };
  } catch (error) {
    console.error('User theme upsert failed:', error);
    throw error;
  }
};
