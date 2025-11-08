# Textbook Studio Setup Guide

A full-featured v0 clone specifically designed for creating educational content, featuring authentication, multi-tenant support, and real-time streaming capabilities.

## Features

- **AI-Powered Content Creation**: Generate comprehensive textbook chapters, exercises, diagrams, and more
- **User Authentication**: Support for registered users, guest accounts, and anonymous usage
- **Multi-Tenant Architecture**: Multiple users share the same v0 API organization with proper ownership tracking
- **Rate Limiting**: Different limits for anonymous (3 chats/day), guest (5 chats/day), and registered users (50 chats/day)
- **Split-Screen Interface**: Chat on the left, real-time preview on the right
- **Persistent Storage**: PostgreSQL database tracks user accounts and chat/project ownership

## Prerequisites

- Node.js 22+
- pnpm 9+ (or npm/yarn)
- PostgreSQL database (Neon Database recommended)
- v0 API key from [v0.dev](https://v0.dev/chat/settings/keys)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# v0 API Key (required)
# Get your API key from https://v0.dev/chat/settings/keys
V0_API_KEY=your_v0_api_key_here

# NextAuth Configuration (required)
# Generate a random secret: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Database Configuration (required)
# Get your connection strings from Neon: https://console.neon.tech
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require

# Optional: For unpooled connections
DATABASE_URL_UNPOOLED=postgresql://user:password@host.region.aws.neon.tech/database?sslmode=require

# AI Gateway (if using for v0 calls)
AI_GATEWAY_API_KEY=your_gateway_api_key_here
```

## Database Setup

### 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection strings
4. Add them to your `.env.local` file

### 2. Initialize Database Tables

The application includes a database initialization API. Start the dev server and run:

```bash
# Start the development server
pnpm dev

# In another terminal, initialize the database
curl -X POST http://localhost:3000/api/db-init

# Or check database status
curl http://localhost:3000/api/db-init/status
```

This will create the following tables:
- `users` - User accounts with authentication
- `project_ownership` - Maps v0 projects to users
- `chat_ownership` - Maps v0 chats to users
- `anonymous_chat_log` - Tracks anonymous chat creation for rate limiting

## Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Initialize the database:**

   ```bash
   pnpm dev
   # Then run the database initialization (see above)
   ```

4. **Start the development server:**

   ```bash
   pnpm dev
   ```

5. **Open the Textbook Studio:**

   Navigate to [http://localhost:3000/textbook-studio](http://localhost:3000/textbook-studio)

## Usage

### User Types & Features

#### Anonymous Users (No Account)
- 3 chats per day
- No data persistence
- No login required
- Limited to basic features

#### Guest Users (Auto-Created)
- 5 chats per day
- Data persists during session
- Click "Continue as Guest" on login page
- Auto-generated temporary account

#### Registered Users (Full Account)
- 50 chats per day
- Full data persistence
- Access from any device
- Create and manage projects
- Chat history saved permanently

### Creating an Account

1. Navigate to `/textbook-studio/auth/register`
2. Enter your email and password (minimum 8 characters)
3. Click "Create Account"
4. You'll be automatically signed in

### Using the Textbook Studio

1. **Start a Chat**: Enter your prompt in the input field
   - Example: "Create a textbook chapter on photosynthesis"
   - Example: "Generate practice exercises for algebra equations"

2. **View Preview**: Generated content appears in the right panel

3. **Continue Conversation**: Send follow-up messages to refine content

4. **New Chat**: Click "New Chat" to start fresh

## API Routes

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/[...nextauth]` - NextAuth authentication

### Chats
- `GET /api/textbook-studio/chats` - List user's chats
- `POST /api/textbook-studio/chats` - Create new chat
- `GET /api/textbook-studio/chats/[chatId]` - Get chat details
- `POST /api/textbook-studio/chats/[chatId]` - Send message to chat

### Projects
- `GET /api/textbook-studio/projects` - List user's projects
- `POST /api/textbook-studio/projects` - Create new project
- `GET /api/textbook-studio/projects/[projectId]` - Get project details

## Architecture

### Multi-Tenant Design

- **v0 API as Source of Truth**: All chat/project data stays in v0 API
- **Ownership Layer**: Database only tracks "who owns what"
- **Access Control**: API routes filter v0 data based on ownership
- **No Data Duplication**: Avoids storing redundant data

### Rate Limiting

Rate limits are enforced per 24-hour period:
- Anonymous: By IP address
- Guest/Registered: By user ID
- Resets daily at midnight

### Session Management

- JWT-based sessions via NextAuth
- 30-day session expiration
- Secure password hashing with bcrypt

## Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Import to Vercel**
3. **Add Environment Variables** in Vercel dashboard:
   - `V0_API_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`

4. **Deploy**

### Database Migration

After deployment, initialize the database:

```bash
curl -X POST https://your-domain.vercel.app/api/db-init
```

## Troubleshooting

### "Unauthorized" Error
- Make sure you're logged in or using guest access
- Check that your session is valid

### "Daily chat limit reached"
- Wait 24 hours or upgrade to a registered account
- Check your current limit in the user dropdown

### Database Connection Errors
- Verify your `DATABASE_URL` is correct
- Check Neon dashboard for connection issues
- Make sure tables are initialized

### v0 API Errors
- Verify your `V0_API_KEY` is valid
- Check v0.dev dashboard for API status
- Review API rate limits

## Development

### Running Tests

```bash
pnpm test:tools
```

### Type Checking

```bash
pnpm type-check
```

### Building for Production

```bash
pnpm build
```

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- Sessions are JWT-based with secure secrets
- Database uses parameterized queries to prevent SQL injection
- Rate limiting prevents abuse
- NextAuth handles CSRF protection

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in the console
3. Check v0 API documentation: [v0.dev/docs](https://v0.dev/docs)
4. Verify environment variables are set correctly

## License

MIT
