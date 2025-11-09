'use server';

import { getNeonClient } from '@/lib/neon';

export type CommentActionState = {
  success: boolean;
  message?: string;
  error?: string;
  hint?: string;
  data?: unknown;
} | null;

export async function createComment(
  prevState: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  try {
    const comment = formData.get('comment') as string;

    if (!comment) {
      return { success: false, error: 'Comment is required' };
    }

    // Connect to the Neon database
    const sql = getNeonClient();

    // Insert the comment from the form into the Postgres database
    const rows = await sql`INSERT INTO comments (comment) VALUES (${comment}) RETURNING *`;
    const insertedRow =
      Array.isArray(rows)
        ? rows[0]
        : typeof rows === 'object' &&
            rows !== null &&
            'rows' in rows &&
            Array.isArray((rows as { rows?: unknown[] }).rows)
          ? (rows as { rows?: unknown[] }).rows?.[0]
          : null;

    return {
      success: true,
      message: 'Comment created successfully',
      data: insertedRow ?? null,
    };
  } catch (error) {
    console.error('Database error:', error);
    
    if (error instanceof Error && error.message.includes('does not exist')) {
      return {
        success: false,
        error: 'Table not found',
        hint: 'Please create the comments table in Neon SQL Editor: CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT NOW());',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


