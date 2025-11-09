# Authentication & Storage Setup

## Overview

Augment now features **optional authentication** with Neon PostgreSQL database storage. Users can:

- **Use without an account** - Full functionality, no sign-up required
- **Create an account** - Save chat history, projects, and health data across devices
- **Sign in** - Access saved data from anywhere

## Features

### For Anonymous Users
- ✅ Full access to all AI features
- ✅ No sign-up required
- ✅ No data collection
- ⚠️ Chat history not saved
- ⚠️ Data lost on browser clear

### For Registered Users
- ✅ Full access to all AI features
- ✅ Chat history saved permanently
- ✅ Access from any device
- ✅ Health data persistence
- ✅ Project management
- ✅ Higher usage limits (50 chats/day vs 3 for anonymous)

## Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
# NextAuth Configuration (required for authentication)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Neon Database (required for user storage)
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 2. Initialize Database

Start your dev server and initialize the database:

```bash
pnpm dev

# In another terminal:
curl -X POST http://localhost:3000/api/db-init
```

This creates the following tables:
- `users` - User accounts with authentication
- `chat_ownership` - Maps chats to users
- `project_ownership` - Maps projects to users
- `anonymous_chat_log` - Rate limiting for anonymous users

### 3. Test the Flow

Navigate to:
- `/auth/signup` - Create a new account
- `/auth/login` - Sign in to existing account
- `/` - Use without account (anonymous)

## User Flow

### Sign Up Flow

1. User visits `/auth/signup`
2. Enters email (name optional)
3. Clicks "Continue" to show password field
4. Enters password (min 8 characters)
5. Clicks "Create Account"
6. Automatically signed in and redirected to `/`
7. Chat history now persists

**Alternative**: Click "Continue Without Account" to use anonymously

### Sign In Flow

1. User visits `/auth/login`
2. Enters email
3. Clicks "Continue" to show password field
4. Enters password
5. Clicks "Sign In"
6. Redirected to `/` with access to saved data

**Alternative**: Click "Continue Without Account" to use anonymously

### Anonymous Flow

1. User visits `/` directly
2. Full functionality available immediately
3. Sidebar shows "Anonymous User"
4. Can click user menu to access Sign Up/Sign In
5. No data persistence

## Components

### New Components

#### `/components/signup-form.tsx`
- Modern signup form with progressive disclosure
- Shows password field after email entry
- Displays benefits of creating an account
- "Continue Without Account" option

#### `/components/login-form.tsx`
- Modern login form with progressive disclosure
- Shows password field after email entry
- "Continue Without Account" option

#### `/components/ui/field.tsx`
- Field components for forms (Field, FieldLabel, FieldDescription, etc.)

### Updated Components

#### `/components/nav-user.tsx`
- Shows "Anonymous User" when not signed in
- Displays Sign Up/Sign In options in dropdown
- Shows user info when authenticated
- Sign Out functionality

#### `/app/layout.tsx`
- Wrapped in `SessionProvider` for NextAuth
- Made client component to support session management

## API Routes

### Authentication

#### `POST /api/auth/register`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### `POST /api/auth/[...nextauth]`
NextAuth authentication endpoint. Handles:
- Credentials login
- Guest account creation
- Session management

### Chat Storage (Textbook Studio)

#### `GET /api/textbook-studio/chats`
List all chats for authenticated user.

**Response:**
```json
{
  "chats": [
    {
      "id": "chat_123",
      "title": "Photosynthesis Chapter",
      "demo": "https://v0.dev/...",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/textbook-studio/chats`
Create a new chat (authenticated or anonymous).

**Request:**
```json
{
  "message": "Create a textbook chapter on photosynthesis",
  "system": "You are an expert educator..."
}
```

**Response:**
```json
{
  "success": true,
  "chat": {
    "id": "chat_123",
    "messages": [...],
    "demo": "https://v0.dev/..."
  }
}
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  user_type VARCHAR(20) DEFAULT 'registered',
  daily_chat_limit INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Chat Ownership Table

```sql
CREATE TABLE chat_ownership (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  v0_chat_id VARCHAR(255) NOT NULL,
  v0_project_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, v0_chat_id)
);
```

### Anonymous Chat Log Table

```sql
CREATE TABLE anonymous_chat_log (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  v0_chat_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Rate Limiting

### Anonymous Users
- **Limit**: 3 chats per day
- **Tracking**: By IP address
- **Reset**: Daily at midnight

### Registered Users
- **Limit**: 50 chats per day
- **Tracking**: By user ID
- **Reset**: Daily at midnight

## Security

### Password Security
- Minimum 8 characters required
- Hashed with bcrypt (10 rounds)
- Never stored in plain text

### Session Security
- JWT-based sessions via NextAuth
- 30-day session expiration
- Secure cookie settings
- CSRF protection enabled

### Database Security
- Parameterized queries (SQL injection safe)
- SSL connections required
- Connection pooling enabled
- Foreign key constraints enforced

## Usage Examples

### Check if User is Authenticated

```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (status === "authenticated") {
    return <div>Welcome, {session.user.email}!</div>;
  }
  
  return <div>Welcome, Anonymous User!</div>;
}
```

### Save Chat History (Server-Side)

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/neon";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    // Save to database
    await query(
      `INSERT INTO chat_ownership (user_id, v0_chat_id)
       VALUES ($1, $2)`,
      [session.user.id, chatId]
    );
  } else {
    // Anonymous user - no storage
    console.log("Anonymous chat created");
  }
}
```

### Sign Out

```typescript
import { signOut } from "next-auth/react";

function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })}>
      Sign Out
    </button>
  );
}
```

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`

4. Deploy

5. Initialize database:
```bash
curl -X POST https://your-domain.vercel.app/api/db-init
```

## Troubleshooting

### "Unauthorized" Error
- Check that `NEXTAUTH_SECRET` is set
- Verify session is valid
- Clear cookies and try again

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection issues
- Ensure tables are initialized

### Password Reset Not Working
- Password reset not yet implemented
- Users can create a new account
- Coming in future update

## Future Enhancements

- [ ] Password reset flow
- [ ] Email verification
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Account deletion
- [ ] Export user data
- [ ] Usage analytics dashboard

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in console
3. Verify environment variables
4. Check database connection
5. Review NextAuth documentation: [next-auth.js.org](https://next-auth.js.org)

## License

MIT

