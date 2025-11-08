import { NextResponse } from 'next/server';
import { query } from '@/lib/neon';

/**
 * Example API route demonstrating Neon DB usage
 * 
 * GET /api/db-example - Test database connection
 * POST /api/db-example - Create a test record
 */
export async function GET() {
  try {
    // Example: Query the database
    // First, ensure you have a table. You can create one in Neon SQL Editor:
    // CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT NOW());
    
    const rows = await query<{ current_time: string }>('SELECT NOW() AS current_time');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: rows,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure DATABASE_URL is set in your .env.local file',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { comment } = body;

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment is required' },
        { status: 400 }
      );
    }

    // Example: Insert a comment
    // Make sure you have created the table first:
    // CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT NOW());
    
    const inserted = await query(
      'INSERT INTO comments (comment) VALUES ($1) RETURNING *',
      [comment]
    );

    return NextResponse.json({
      success: true,
      message: 'Comment created successfully',
      data: inserted[0] ?? null,
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Check if it's a table doesn't exist error
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Table not found',
          hint: 'Please create the comments table in Neon SQL Editor: CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMP DEFAULT NOW());',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

