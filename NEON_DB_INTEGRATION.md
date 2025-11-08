# Neon DB Integration

This project includes full integration with Neon PostgreSQL database, providing both serverless-optimized and connection-pooled approaches.

## Overview

Neon is a serverless Postgres database that's perfect for Next.js applications. This integration provides:

- **Serverless client** (`@neondatabase/serverless`) - Optimized for Next.js Server Actions and Edge Functions
- **Postgres client** (`postgres`) - Full-featured client with connection pooling support
- **Utility functions** - Easy-to-use helpers for common database operations

## Setup

### 1. Environment Variables

Add your Neon database connection string to `.env.local`:

```bash
# Recommended for most uses (with connection pooling)
DATABASE_URL=postgresql://neondb_owner:npg_3CnOGubvJ8zh@ep-frosty-sound-a4g18j9l-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# For uses requiring a connection without pgbouncer
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_3CnOGubvJ8zh@ep-frosty-sound-a4g18j9l.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Alternatively, you can use the Vercel Postgres format:

```bash
POSTGRES_URL=postgresql://neondb_owner:npg_3CnOGubvJ8zh@ep-frosty-sound-a4g18j9l-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Create Your Database Tables

Navigate to the Neon SQL Editor in the Neon Console and create your tables. For example:

```sql
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

You can access the Neon Console from the Storage tab on your Vercel Dashboard, or directly at [console.neon.tech](https://console.neon.tech).

## Usage

### Serverless Client (Recommended for Server Actions)

The serverless client is optimized for Next.js Server Actions and Edge Functions:

```typescript
import { getNeonClient } from '@/lib/neon';

async function createComment(formData: FormData) {
  'use server';
  
  const sql = getNeonClient();
  const comment = formData.get('comment') as string;
  
  const rows = await sql`
    INSERT INTO comments (comment)
    VALUES (${comment})
    RETURNING *
  `;
  
  return rows[0] ?? null;
}
```

### Postgres Client (For Connection Pooling)

Use the postgres client when you need connection pooling or more advanced features:

```typescript
import { getPostgresClient } from '@/lib/neon';

async function getComments() {
  const client = getPostgresClient();
  const comments = await client`SELECT * FROM comments ORDER BY created_at DESC`;
  return comments;
}
```

### Helper Functions

The utility library provides convenient helper functions:

```typescript
import { query } from '@/lib/neon';

// Simple query helper
const [comment] = await query('SELECT * FROM comments WHERE id = $1', [1]);

// With transactions (using postgres client)
import { withTransaction } from '@/lib/neon';

await withTransaction(async (client) => {
  await client`INSERT INTO comments (comment) VALUES (${comment1})`;
  await client`INSERT INTO comments (comment) VALUES (${comment2})`;
});
```

## Examples

### API Route Example

See [`app/api/db-example/route.ts`](app/api/db-example/route.ts) for a complete API route example.

```typescript
import { query } from '@/lib/neon';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { comment } = await request.json();
  
  const [created] = await query(
    'INSERT INTO comments (comment) VALUES ($1) RETURNING *',
    [comment]
  );
  
  return NextResponse.json({ success: true, data: created });
}
```

### Server Action Example

See [`app/db-demo-server-action/page.tsx`](app/db-demo-server-action/page.tsx) for a complete Server Action example.

```typescript
import { getNeonClient } from '@/lib/neon';

async function createComment(formData: FormData) {
  'use server';
  
  const sql = getNeonClient();
  const comment = formData.get('comment') as string;
  
  await sql`
    INSERT INTO comments (comment)
    VALUES (${comment})
  `;
}
```

### Client Component Example

See [`app/db-demo/page.tsx`](app/db-demo/page.tsx) for a client component that uses API routes.

## Demo Pages

Two demo pages are available to test the integration:

1. **API Route Demo**: `/db-demo` - Uses API routes with client-side React
2. **Server Action Demo**: `/db-demo-server-action` - Uses Next.js Server Actions

## Important Notes

### Serverless Limitations

The Neon serverless driver (`@neondatabase/serverless`) doesn't support traditional transactions. If you need transactions, use the `postgres` client with the `withTransaction` helper.

### Connection Pooling

- Use `DATABASE_URL` (with `-pooler` in the hostname) for connection pooling
- Use `DATABASE_URL_UNPOOLED` (without `-pooler`) for direct connections when needed

### SSL Requirements

All connections require SSL. The connection strings include `sslmode=require` by default.

## Troubleshooting

### "Missing DATABASE_URL" Error

Make sure you've added `DATABASE_URL` to your `.env.local` file and restarted your development server.

### "Table does not exist" Error

Create your tables in the Neon SQL Editor before using them in your application.

### Connection Timeouts

If you experience connection timeouts:
- Check that your connection string is correct
- Verify your Neon project is active
- Try using the pooled connection string (`-pooler` in hostname)

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Postgres.js Documentation](https://github.com/porsager/postgres)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

