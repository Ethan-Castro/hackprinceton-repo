/**
 * Database Initialization Module
 * 
 * This module handles creating and initializing all required database tables
 * for the AI Gateway application. Run this before starting the application
 * if tables don't exist.
 */

import { getNeonClient, queryWithPostgres } from './neon';

/**
 * SQL schema definitions for all tables
 */
const SCHEMA_DEFINITIONS = {
  // Comments table - used in database demo
  comments: `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Posts table - example for data management
  posts: `
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Trackers table - for health tracking
  trackers: `
    CREATE TABLE IF NOT EXISTS trackers (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Tracker entries - health tracking data points
  tracker_entries: `
    CREATE TABLE IF NOT EXISTS tracker_entries (
      id SERIAL PRIMARY KEY,
      tracker_id INTEGER NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
      value FLOAT NOT NULL,
      notes TEXT,
      recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Templates table - for storing document/content templates
  templates: `
    CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      template_data JSONB NOT NULL,
      variables JSONB,
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Chat history - for storing conversations
  chat_history: `
    CREATE TABLE IF NOT EXISTS chat_history (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      model VARCHAR(100),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // AI Gateway Generations - for tracking generation IDs and metrics
  generations: `
    CREATE TABLE IF NOT EXISTS generations (
      id SERIAL PRIMARY KEY,
      generation_id VARCHAR(255) UNIQUE NOT NULL,
      model VARCHAR(100),
      provider_name VARCHAR(100),
      total_cost DECIMAL(10, 6),
      tokens_prompt INTEGER,
      tokens_completion INTEGER,
      latency INTEGER,
      generation_time INTEGER,
      is_byok BOOLEAN DEFAULT false,
      streamed BOOLEAN DEFAULT false,
      session_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // V0 Clone: Users table - for authentication
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      user_type VARCHAR(20) DEFAULT 'registered' CHECK (user_type IN ('anonymous', 'guest', 'registered')),
      daily_chat_limit INTEGER DEFAULT 50,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // V0 Clone: Project ownership mapping
  project_ownership: `
    CREATE TABLE IF NOT EXISTS project_ownership (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      v0_project_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, v0_project_id)
    );
  `,

  // V0 Clone: Chat ownership mapping
  chat_ownership: `
    CREATE TABLE IF NOT EXISTS chat_ownership (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      v0_chat_id VARCHAR(255) NOT NULL,
      v0_project_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, v0_chat_id)
    );
  `,

  // V0 Clone: Anonymous chat log for rate limiting
  anonymous_chat_log: `
    CREATE TABLE IF NOT EXISTS anonymous_chat_log (
      id SERIAL PRIMARY KEY,
      ip_address VARCHAR(45) NOT NULL,
      v0_chat_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Indexes for common queries
  indexes: `
    CREATE INDEX IF NOT EXISTS idx_trackers_user_id ON trackers(user_id);
    CREATE INDEX IF NOT EXISTS idx_tracker_entries_tracker_id ON tracker_entries(tracker_id);
    CREATE INDEX IF NOT EXISTS idx_tracker_entries_recorded_at ON tracker_entries(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
    CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
    CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
    CREATE INDEX IF NOT EXISTS idx_generations_generation_id ON generations(generation_id);
    CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
    CREATE INDEX IF NOT EXISTS idx_generations_session_id ON generations(session_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_project_ownership_user_id ON project_ownership(user_id);
    CREATE INDEX IF NOT EXISTS idx_project_ownership_v0_project_id ON project_ownership(v0_project_id);
    CREATE INDEX IF NOT EXISTS idx_chat_ownership_user_id ON chat_ownership(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_ownership_v0_chat_id ON chat_ownership(v0_chat_id);
    CREATE INDEX IF NOT EXISTS idx_anonymous_chat_log_ip ON anonymous_chat_log(ip_address);
    CREATE INDEX IF NOT EXISTS idx_anonymous_chat_log_created_at ON anonymous_chat_log(created_at);
  `,
};

/**
 * Initialize the database with required tables
 * Returns the number of tables created/verified
 */
export async function initializeDatabase(): Promise<{
  success: boolean;
  message: string;
  tablesCreated: string[];
  errors: string[];
}> {
  const tablesCreated: string[] = [];
  const errors: string[] = [];

  try {
    console.log('🗄️  Starting database initialization...');

    // Create each table
    for (const [tableName, sql] of Object.entries(SCHEMA_DEFINITIONS)) {
      if (tableName === 'indexes') continue; // Handle indexes separately

      try {
        const client = getNeonClient();
        await client.query(sql);
        tablesCreated.push(tableName);
        console.log(`✅ Table '${tableName}' created or verified`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to create table '${tableName}': ${errorMsg}`);
        console.error(`❌ Error creating table '${tableName}':`, error);
      }
    }

    // Create indexes
    try {
      const client = getNeonClient();
      await client.query(SCHEMA_DEFINITIONS.indexes);
      console.log('✅ Indexes created or verified');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️  Warning creating indexes: ${errorMsg}`);
    }

    return {
      success: errors.length === 0,
      message: `Database initialization complete. Created/verified ${tablesCreated.length} tables.`,
      tablesCreated,
      errors,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Database initialization failed: ${errorMsg}`,
      tablesCreated,
      errors: [...errors, errorMsg],
    };
  }
}

/**
 * Verify database connection and check if tables exist
 */
export async function verifyDatabaseConnection(): Promise<{
  connected: boolean;
  tables: string[];
  error?: string;
}> {
  try {
    const result = await queryWithPostgres<{ table_name: string }>`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    return {
      connected: true,
      tables: result.map((row) => row.table_name),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      connected: false,
      tables: [],
      error: errorMsg,
    };
  }
}

/**
 * Drop all tables (⚠️ Use with caution!)
 */
export async function resetDatabase(): Promise<{
  success: boolean;
  message: string;
  tablesDropped: string[];
}> {
  const tablesDropped: string[] = [];

  try {
    console.warn('⚠️  Resetting database - all data will be lost!');

    const tables = [
      'anonymous_chat_log',
      'chat_ownership',
      'project_ownership',
      'tracker_entries',
      'trackers',
      'templates',
      'posts',
      'comments',
      'chat_history',
      'generations',
      'users',
    ];

    for (const table of tables) {
      try {
        const client = getNeonClient();
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        tablesDropped.push(table);
        console.log(`🗑️  Dropped table '${table}'`);
      } catch (error) {
        console.error(`Error dropping table '${table}':`, error);
      }
    }

    return {
      success: true,
      message: `Database reset complete. Dropped ${tablesDropped.length} tables.`,
      tablesDropped,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Database reset failed: ${errorMsg}`,
      tablesDropped,
    };
  }
}

