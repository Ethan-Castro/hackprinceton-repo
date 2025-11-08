# v0 Clone

A clean, production-ready v0.dev clone with authentication and multi-tenant support. This is a **generic v0 interface** - not specific to any use case.

## Features

- **Pure v0 Experience**: Clean interface matching v0.dev
- **Split-Screen Layout**: Chat on left, live preview on right
- **User Authentication**: Support for registered users, guests, and anonymous usage
- **Multi-Tenant**: Multiple users sharing the same v0 API organization
- **Rate Limiting**:
  - Anonymous: 3 chats/day
  - Guest: 5 chats/day
  - Registered: 50 chats/day
- **Real-Time Preview**: See your generated UI instantly
- **Persistent Storage**: Chat and project ownership tracked in PostgreSQL

## Access

Navigate to: [http://localhost:3000/v0-clone](http://localhost:3000/v0-clone)

## Usage

### Without Account (Anonymous)
- Visit `/v0-clone`
- Start building immediately
- 3 chats per day
- No data persistence

### With Guest Account
- Click "Sign In" → "Continue as Guest"
- 5 chats per day
- Session-based persistence

### With Full Account
- Click "Sign Up" and create an account
- 50 chats per day
- Full persistence across devices
- Project management

## Example Prompts

Try these to get started:

- "A landing page for a SaaS startup"
- "A todo app with drag and drop"
- "A pricing page with three tiers"
- "A dashboard with charts and stats"
- "A blog layout with sidebar"
- "An e-commerce product grid"

## Architecture

### Clean Separation

The v0 clone is **completely separate** from the Textbook Studio:

- **v0 Clone** (`/v0-clone`): Generic UI generation
  - No educational branding
  - Generic v0.dev experience
  - Standard v0 system prompts

- **Textbook Studio** (`/textbook-studio`): Educational content creation
  - Educational branding
  - Textbook-specific prompts
  - Specialized for learning content

### Shared Infrastructure

Both interfaces share:
- Authentication system (NextAuth)
- Database for ownership tracking
- v0 API integration
- Rate limiting logic

### How It Works

1. **User Request**: User describes a UI
2. **v0 API**: Generates the code using v0's models
3. **Database**: Tracks ownership (who owns which chat/project)
4. **Preview**: Shows live preview in iframe

## API Routes

The v0 clone uses the same API routes as the textbook studio:

- `POST /api/textbook-studio/chats` - Create new chat
- `GET /api/textbook-studio/chats` - List user's chats
- `POST /api/textbook-studio/chats/[chatId]` - Send message
- `GET /api/textbook-studio/chats/[chatId]` - Get chat details

**Note**: The API route names include "textbook-studio" for historical reasons, but they work generically when no `system` prompt is provided.

## Key Differences from Textbook Studio

| Feature | v0 Clone | Textbook Studio |
|---------|----------|-----------------|
| Purpose | Generic UI generation | Educational content |
| Branding | v0 logo & name | Textbook Studio branding |
| System Prompt | Default v0 prompt | Educational specialist |
| Example Prompts | SaaS, dashboards, apps | Chapters, exercises, diagrams |
| Target Users | Developers | Educators & students |

## Environment Setup

Same as Textbook Studio - requires:

```bash
V0_API_KEY=your_v0_api_key
NEXTAUTH_SECRET=your_secret
DATABASE_URL=your_postgres_url
```

See [TEXTBOOK_STUDIO_SETUP.md](TEXTBOOK_STUDIO_SETUP.md) for full setup instructions.

## Deployment

Deploy to Vercel with the same environment variables. Both `/v0-clone` and `/textbook-studio` will work from the same deployment.

## Development

```bash
# Start dev server
pnpm dev

# Access v0 clone
open http://localhost:3000/v0-clone

# Access textbook studio
open http://localhost:3000/textbook-studio
```

## Limitations

- v0 API rate limits apply
- Database connection required for multi-user support
- Anonymous users limited to 3 chats/day by IP

## Future Enhancements

Potential features to add:

- [ ] Multiple generations (A/B/C like v0.dev)
- [ ] Version history for chats
- [ ] Export to CodeSandbox/StackBlitz
- [ ] File editing within the interface
- [ ] Project templates
- [ ] Collaboration features
- [ ] Integration with GitHub

## License

MIT
