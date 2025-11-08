/**
 * Database Initialization API Route
 * 
 * POST /api/db-init - Initialize the database with all required tables
 * GET /api/db-init/status - Check database connection status and existing tables
 * 
 * ⚠️ For development use only. Should be protected in production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, verifyDatabaseConnection } from '@/lib/db-init';

/**
 * GET /api/db-init/status
 * Check database connection and existing tables
 */
export async function GET(request: NextRequest) {
  try {
    const result = await verifyDatabaseConnection();

    if (!result.connected) {
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: result.error,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'connected',
      existingTables: result.tables,
      tableCount: result.tables.length,
      message: `Connected to database with ${result.tables.length} tables`,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to check database status',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/db-init
 * Initialize the database with all required tables
 * 
 * Query parameters:
 * - force: 'true' to reinitialize even if tables exist
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication check for production
    // const authHeader = req.headers.get('authorization');
    // if (!authHeader) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const searchParams = req.nextUrl.searchParams;
    const force = searchParams.get('force') === 'true';

    // Check current state
    const currentState = await verifyDatabaseConnection();

    if (!currentState.connected) {
      return NextResponse.json(
        {
          error: 'Cannot initialize: database connection failed',
          details: currentState.error,
        },
        { status: 503 }
      );
    }

    if (currentState.tables.length > 0 && !force) {
      return NextResponse.json({
        status: 'already_initialized',
        existingTables: currentState.tables,
        tableCount: currentState.tables.length,
        message: 'Database already has tables. Use ?force=true to reinitialize.',
      });
    }

    // Initialize database
    const result = await initializeDatabase();

    if (!result.success) {
      return NextResponse.json(
        {
          status: 'partial_failure',
          created: result.tablesCreated,
          errors: result.errors,
          message: result.message,
        },
        { status: 207 } // Multi-Status
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        created: result.tablesCreated,
        message: result.message,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Database initialization failed',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}

