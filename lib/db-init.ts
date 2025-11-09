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

  // Healthcare Providers - store healthcare provider information
  healthcare_providers: `
    CREATE TABLE IF NOT EXISTS healthcare_providers (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      specialty VARCHAR(100),
      license_number VARCHAR(255),
      phone VARCHAR(20),
      email VARCHAR(255),
      website VARCHAR(255),
      office_location TEXT,
      accepting_new_patients BOOLEAN DEFAULT true,
      languages JSONB,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Insurance Plans - store insurance plan details
  insurance_plans: `
    CREATE TABLE IF NOT EXISTS insurance_plans (
      id VARCHAR(255) PRIMARY KEY,
      provider VARCHAR(255) NOT NULL,
      plan VARCHAR(255) NOT NULL,
      policy_number VARCHAR(255) NOT NULL,
      member_id VARCHAR(255) NOT NULL,
      group_number VARCHAR(255),
      coverage_type VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      copay DECIMAL(10, 2),
      deductible DECIMAL(10, 2),
      out_of_pocket_max DECIMAL(10, 2),
      coverage JSONB,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Medications - track medications
  medications: `
    CREATE TABLE IF NOT EXISTS medications (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      dosage VARCHAR(100) NOT NULL,
      frequency VARCHAR(255) NOT NULL,
      reason VARCHAR(255) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      prescribed_by VARCHAR(255),
      pharmacy VARCHAR(255),
      refills_remaining INTEGER DEFAULT 0,
      side_effects JSONB,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Medication Entries - log medication doses taken
  medication_entries: `
    CREATE TABLE IF NOT EXISTS medication_entries (
      id VARCHAR(255) PRIMARY KEY,
      medication_id VARCHAR(255) NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
      taken_at TIMESTAMP NOT NULL,
      taken BOOLEAN NOT NULL DEFAULT true,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Appointments - schedule and track appointments
  appointments: `
    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      provider_name VARCHAR(255),
      appointment_date DATE NOT NULL,
      appointment_time TIME,
      duration INTEGER,
      location TEXT,
      type VARCHAR(100),
      notes TEXT,
      reminder_minutes_before INTEGER DEFAULT 1440,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Vital Signs - log blood pressure, heart rate, temperature, oxygen, weight
  vital_signs: `
    CREATE TABLE IF NOT EXISTS vital_signs (
      id VARCHAR(255) PRIMARY KEY,
      recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
      systolic INTEGER,
      diastolic INTEGER,
      heart_rate INTEGER,
      temperature DECIMAL(5, 1),
      oxygen_saturation INTEGER,
      weight DECIMAL(6, 2),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Activities - track physical activities and exercise
  activities: `
    CREATE TABLE IF NOT EXISTS activities (
      id VARCHAR(255) PRIMARY KEY,
      activity_date DATE NOT NULL,
      activity_type VARCHAR(255) NOT NULL,
      duration INTEGER NOT NULL,
      calories INTEGER,
      intensity VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Nutrition Logs - track meals and nutrition information
  nutrition_logs: `
    CREATE TABLE IF NOT EXISTS nutrition_logs (
      id VARCHAR(255) PRIMARY KEY,
      meal_date DATE NOT NULL,
      meal_type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      estimated_calories INTEGER,
      protein DECIMAL(8, 2),
      carbs DECIMAL(8, 2),
      fat DECIMAL(8, 2),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,

  // Health Goals - store health goals and targets
  health_goals: `
    CREATE TABLE IF NOT EXISTS health_goals (
      id VARCHAR(255) PRIMARY KEY,
      goal_type VARCHAR(255) NOT NULL,
      target_value DECIMAL(10, 2) NOT NULL,
      unit VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      progress DECIMAL(10, 2),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
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
    CREATE INDEX IF NOT EXISTS idx_healthcare_providers_specialty ON healthcare_providers(specialty);
    CREATE INDEX IF NOT EXISTS idx_healthcare_providers_name ON healthcare_providers(name);
    CREATE INDEX IF NOT EXISTS idx_insurance_plans_provider ON insurance_plans(provider);
    CREATE INDEX IF NOT EXISTS idx_insurance_plans_start_date ON insurance_plans(start_date);
    CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
    CREATE INDEX IF NOT EXISTS idx_medications_start_date ON medications(start_date);
    CREATE INDEX IF NOT EXISTS idx_medication_entries_medication_id ON medication_entries(medication_id);
    CREATE INDEX IF NOT EXISTS idx_medication_entries_taken_at ON medication_entries(taken_at);
    CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments(appointment_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_provider_name ON appointments(provider_name);
    CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_at ON vital_signs(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_activities_activity_date ON activities(activity_date);
    CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON activities(activity_type);
    CREATE INDEX IF NOT EXISTS idx_nutrition_logs_meal_date ON nutrition_logs(meal_date);
    CREATE INDEX IF NOT EXISTS idx_nutrition_logs_meal_type ON nutrition_logs(meal_type);
    CREATE INDEX IF NOT EXISTS idx_health_goals_status ON health_goals(status);
    CREATE INDEX IF NOT EXISTS idx_health_goals_goal_type ON health_goals(goal_type);
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
      'medication_entries',
      'medications',
      'appointments',
      'vital_signs',
      'activities',
      'nutrition_logs',
      'health_goals',
      'insurance_plans',
      'healthcare_providers',
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

