# Getting Started with Database Storage

Welcome! Your Augment application now has persistent database storage fully configured. This guide will help you get up and running in just a few minutes.

## 📍 Current Status

✅ **Database System:** Neon PostgreSQL (us-east-1)  
✅ **Connection:** Serverless with automatic pooling  
✅ **Tables:** 6 pre-defined schemas ready to initialize  
✅ **Documentation:** Complete with examples  
✅ **API Endpoints:** Built-in management endpoints  

## 🚀 Get Started in 3 Steps (5 minutes)

### Step 1: Configure Your Environment

Add your database connection string to `.env.local` in your project root:

```bash
# Copy this line to .env.local
DATABASE_URL=postgresql://neondb_owner:npg_3CnOGubvJ8zh@ep-frosty-sound-a4g18j9l-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**File location:** `/Users/ethancastro/vercel-ai-gateway-demo1/.env.local`

⚠️ **Important:** `.env.local` is gitignored - your credentials stay safe!

### Step 2: Initialize Database Tables

Start your dev server:
```bash
npm run dev
```

In another terminal, initialize the database:
```bash
curl -X POST http://localhost:3000/api/db-init
```

Expected response:
```json
{
  "status": "success",
  "created": [
    "comments",
    "posts", 
    "trackers",
    "tracker_entries",
    "templates",
    "chat_history"
  ],
  "message": "Database initialization complete. Created/verified 6 tables."
}
```

### Step 3: Test It Works

Visit http://localhost:3000/db-demo in your browser

- Type a comment and click Submit
- Refresh the page
- If your comment is still there, everything works! ✅

## 📚 What's Available

### Pre-built Tables

| Table | Use Case | Example |
|-------|----------|---------|
| **comments** | Demo/test data | Store user comments |
| **posts** | Blog content | Articles, news posts |
| **trackers** | Health tracking | Fitness, wellness metrics |
| **tracker_entries** | Measurement data | Heart rate, weight readings |
| **templates** | Document templates | Reusable email, doc templates |
| **chat_history** | Conversations | AI chat history, logs |

### Database Tools

Located in `lib/neon.ts`:

```typescript
// Simple queries
import { query, queryOne } from '@/lib/neon';

// Get all records
const results = await query('SELECT * FROM comments');

// Get single record
const first = await queryOne('SELECT * FROM comments LIMIT 1');

// Safe parameters (prevent SQL injection)
const found = await queryOne(
  'SELECT * FROM comments WHERE id = $1',
  [commentId]
);
```

### Management API

```bash
# Check database connection
curl http://localhost:3000/api/db-init/status

# Initialize (creates tables)
curl -X POST http://localhost:3000/api/db-init

# Reinitialize (dangerous! ⚠️ deletes all data)
curl -X POST http://localhost:3000/api/db-init?force=true
```

## 🛠️ Using the Database in Your Code

### In Server Components (Recommended)

```typescript
// app/page.tsx
import { query } from '@/lib/neon';

export default async function Page() {
  const comments = await query(
    'SELECT * FROM comments ORDER BY created_at DESC'
  );

  return (
    <div>
      <h1>Comments</h1>
      {comments.map(comment => (
        <p key={comment.id}>{comment.comment}</p>
      ))}
    </div>
  );
}
```

### With Server Actions

```typescript
// app/page.tsx
import { query } from '@/lib/neon';

export async function addComment(formData: FormData) {
  'use server';
  const text = formData.get('comment');
  await query(
    'INSERT INTO comments (comment) VALUES ($1)',
    [text]
  );
}

export default function AddCommentForm() {
  return (
    <form action={addComment}>
      <input name="comment" placeholder="Your comment..." required />
      <button type="submit">Add Comment</button>
    </form>
  );
}
```

### In API Routes

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

## 🔍 Example Pages in Your App

Check out these demo pages to see the database in action:

- **http://localhost:3000/db-demo** - Form with database storage
- **http://localhost:3000/db-demo-server-action** - Using Server Actions

## ❓ Common Questions

**Q: Where are my connection credentials?**  
A: In `.env.local` (keep secret!) and documented in `env.example` for reference.

**Q: Can I use this data on another computer?**  
A: Yes! Everyone sharing the same `DATABASE_URL` can access the same data.

**Q: How do I add new tables?**  
A: Edit `lib/db-init.ts`, add your SQL, then run `/api/db-init` or use Neon console.

**Q: Is this safe?**  
A: Yes! All queries use parameterized statements (no SQL injection risk).

**Q: Can I modify table schemas?**  
A: Yes via Neon console or by editing `lib/db-init.ts` and re-running initialization.

## 🐛 Troubleshooting

### Issue: "Missing database connection string"
**Solution:** Verify `.env.local` contains `DATABASE_URL` and restart dev server

### Issue: "Connection refused"  
**Solution:** Check your internet, verify the connection string is correct

### Issue: "relation ... does not exist"
**Solution:** Run `curl -X POST http://localhost:3000/api/db-init` to create tables

### Issue: "Permission denied"
**Solution:** Verify the Neon user has proper permissions or contact Neon support

## 📖 Learn More

- **Quick Reference:** Read `STORAGE_SETUP.md`
- **Full Guide:** Read `DATABASE_SETUP.md`
- **Technical Details:** Read `STORAGE_README.md`

## ✨ What's Next

1. ✅ Set up `.env.local` with `DATABASE_URL`
2. ✅ Initialize tables with `/api/db-init`
3. ✅ Test with http://localhost:3000/db-demo
4. 🎯 **Start here:** Use the query examples above in your own pages
5. 📚 Reference `DATABASE_SETUP.md` as you build

## 🚀 You're All Set!

Your database is ready to store data for:
- Health tracking
- Chat conversations
- Document templates
- User comments
- Blog posts
- Whatever you build!

Start by visiting `/db-demo` to see it in action, then build your own features!

---

**Need help?** Check the troubleshooting section or the comprehensive guides referenced above.

**Ready to build?** Start adding database queries to your pages!

