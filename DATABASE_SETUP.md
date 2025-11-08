# Database Setup Guide

This guide will help you set up and initialize the PostgreSQL database for the AI Gateway application using Neon.

## Quick Start

### 1. Configure Environment Variables

Copy your Neon database connection string to `.env.local`:

```bash
# Recommended (with connection pooling)
DATABASE_URL=postgresql://neondb_owner:npg_3CnOGubvJ8zh@ep-frosty-sound-a4g18j9l-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Optional (for transactions without pooling)
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_3CnOGubvJ8zh@ep-frosty-sound-a4g18j9l.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Note:** The actual connection strings are in `env.example`. Copy them to `.env.local` (which is gitignored for security).

### 2. Initialize the Database

You have several options to initialize the database:

#### Option A: Use the API Endpoint (Recommended for Development)

```bash
# Check database connection status
curl http://localhost:3000/api/db-init/status

# Initialize the database
curl -X POST http://localhost:3000/api/db-init

# Reinitialize (drop and recreate tables)
curl -X POST http://localhost:3000/api/db-init?force=true
```

#### Option B: Use the Neon SQL Editor

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project and database
3. Open the SQL Editor
4. Run each of these SQL commands:

```sql
-- Comments table (used in db-demo examples)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trackers table (for health tracking)
CREATE TABLE IF NOT EXISTS trackers (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tracker entries (health data points)
CREATE TABLE IF NOT EXISTS tracker_entries (
  id SERIAL PRIMARY KEY,
  tracker_id INTEGER NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
  value FLOAT NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Templates table
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

-- Chat history
CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  model VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trackers_user_id ON trackers(user_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_tracker_id ON tracker_entries(tracker_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_recorded_at ON tracker_entries(recorded_at);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
```

#### Option C: Initialize Programmatically

In your Next.js application:

```typescript
import { initializeDatabase } from '@/lib/db-init';

// Call during app initialization
const result = await initializeDatabase();
console.log(result);
// Output:
// {
//   success: true,
//   message: "Database initialization complete. Created/verified 6 tables.",
//   tablesCreated: ["comments", "posts", "trackers", "tracker_entries", "templates", "chat_history"],
//   errors: []
// }
```

### 3. Verify Setup

Check that everything is working:

```bash
# Run the database demo
npm run dev

# Navigate to http://localhost:3000/db-demo
# Or http://localhost:3000/db-demo-server-action

# Try adding a comment to test the connection
```

## Database Structure

### Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `comments` | Demo comments storage | id, comment, created_at |
| `posts` | Blog/content posts | id, title, content, created_at, updated_at |
| `trackers` | Health tracker definitions | id, user_id, name, description, type |
| `tracker_entries` | Health data points | id, tracker_id, value, notes, recorded_at |
| `templates` | Stored document templates | id, name, category, template_data (JSONB), variables (JSONB) |
| `chat_history` | Conversation history | id, session_id, role, content, model, metadata (JSONB) |

### Connection Pooling

The application supports two connection modes:

1. **Pooled (DEFAULT)** - `DATABASE_URL`
   - Recommended for most use cases
   - Uses pgbouncer for connection pooling
   - Suitable for serverless/serverful environments
   - Better for high-concurrency scenarios

2. **Unpooled** - `DATABASE_URL_UNPOOLED`
   - Required for transactions and prepared statements
   - Better transaction isolation
   - Use when you need explicit transaction control

## Using the Database

### Basic Query Examples

```typescript
import { query, queryOne } from '@/lib/neon';

// Get all comments
const comments = await query('SELECT * FROM comments ORDER BY created_at DESC');

// Get a single comment
const comment = await queryOne(
  'SELECT * FROM comments WHERE id = $1',
  [1]
);

// Insert a comment
await query(
  'INSERT INTO comments (comment) VALUES ($1)',
  ['Hello, World!']
);

// Update with unpooled connection
import { queryWithPostgres, withTransaction } from '@/lib/neon';

const result = await queryWithPostgres`
  INSERT INTO comments (comment)
  VALUES (${'New comment'})
  RETURNING *
`;
```

### Using in Server Components

```typescript
// app/page.tsx
import { query } from '@/lib/neon';

export default async function Page() {
  const comments = await query('SELECT * FROM comments');
  
  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id}>{comment.comment}</div>
      ))}
    </div>
  );
}
```

### Using in Server Actions

```typescript
// app/page.tsx
'use server';

import { query } from '@/lib/neon';

export async function addComment(formData: FormData) {
  const comment = formData.get('comment');
  await query(
    'INSERT INTO comments (comment) VALUES ($1)',
    [comment]
  );
}

export default function Page() {
  return (
    <form action={addComment}>
      <input name="comment" placeholder="Add a comment..." />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Using in API Routes

```typescript
// app/api/comments/route.ts
import { query } from '@/lib/neon';
import { NextResponse } from 'next/server';

export async function GET() {
  const comments = await query('SELECT * FROM comments');
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const { comment } = await request.json();
  const result = await query(
    'INSERT INTO comments (comment) VALUES ($1) RETURNING *',
    [comment]
  );
  return NextResponse.json(result[0], { status: 201 });
}
```

## Troubleshooting

### Connection String Issues

**Error:** `Missing database connection string`
- **Solution:** Ensure `DATABASE_URL` is set in `.env.local`
- Check that the URL is not empty or malformed

**Error:** `ECONNREFUSED`
- **Solution:** Verify the database is running and accessible
- Check your internet connection
- Ensure the IP address is whitelisted in Neon (if applicable)

### SSL/TLS Issues

**Error:** `self signed certificate`
- **Solution:** The connection string should include `?sslmode=require`
- This is already configured in the example strings

### Table Creation Fails

**Error:** `relation already exists`
- **Solution:** Tables already exist, which is fine
- Use `CREATE TABLE IF NOT EXISTS` (already included in schema)

**Error:** `permission denied`
- **Solution:** Ensure your Neon user has proper permissions
- Contact Neon support if needed

### Performance Issues

- **Use indexed columns:** `user_id`, `tracker_id`, `session_id`, etc.
- **Batch operations:** Group multiple queries when possible
- **Use unpooled for transactions:** For better transaction isolation
- **Monitor connection limits:** Neon has connection limits per plan

## Environment Variables Reference

```bash
# Primary connection (with pooling)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Unpooled connection (for transactions)
DATABASE_URL_UNPOOLED=postgresql://user:password@host-unpooled/database?sslmode=require

# Vercel Postgres alternatives (if applicable)
POSTGRES_URL=...
POSTGRES_URL_NON_POOLING=...
```

## Next Steps

1. ✅ Configure environment variables
2. ✅ Initialize database tables
3. ✅ Test with `/db-demo` or `/db-demo-server-action`
4. 📚 Read `lib/neon.ts` for advanced usage
5. 🔌 Start building with database queries

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Database Integration](https://nextjs.org/learn/basics/with-sql)

---

**For Production Deployments:**
- Use environment secrets in Vercel/your hosting platform
- Implement connection pooling appropriately
- Add SQL injection protection via parameterized queries (already done)
- Monitor query performance and optimize indexes
- Regular backups via Neon's backup features
- Consider read replicas for high-traffic scenarios

