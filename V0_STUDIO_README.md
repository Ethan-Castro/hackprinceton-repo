# v0 Studio - Domain-Specific AI Content Generators

Professional-grade v0.dev clones built with AI Elements for Education, Health, Business, and Sustainability.

## Overview

The v0 Studio system provides four specialized AI content generation interfaces, each optimized for a specific domain. All implementations use the official AI Elements components from the v0 Platform API documentation.

## Features

### ✅ Properly Implemented Per v0 Docs

All components now use the **official AI Elements** library:

- **`Conversation`** / **`ConversationContent`** - Structured chat layout
- **`Message`** / **`MessageContent`** - Proper message rendering
- **`PromptInput`** / **`PromptInputTextarea`** / **`PromptInputSubmit`** - Advanced input system
- **`Suggestions`** / **`Suggestion`** - Example prompt cards
- **`Loader`** - AI Elements loading indicator
- **`WebPreview`** / **`WebPreviewNavigation`** / **`WebPreviewUrl`** / **`WebPreviewBody`** - Live preview panel

### 🎯 Domain-Specific Features

Each studio has:
- Custom branding (icon, colors, title)
- Domain-specific example prompts
- Specialized system prompts for content generation
- Tailored empty states and messaging

## Routes

Access each studio at these URLs:

| Domain | URL | Icon |
|--------|-----|------|
| **Education** | [http://localhost:3001/education/studio](http://localhost:3001/education/studio) | 🎓 GraduationCap |
| **Health** | [http://localhost:3001/health/studio](http://localhost:3001/health/studio) | ❤️ Heart |
| **Business** | [http://localhost:3001/business/studio](http://localhost:3001/business/studio) | 💼 Briefcase |
| **Sustainability** | [http://localhost:3001/sustainability/studio](http://localhost:3001/sustainability/studio) | 🌱 Leaf |

## Architecture

### Component Structure

```
components/v0-studio/
├── BaseV0Chat.tsx           # Base component with AI Elements
├── EducationV0Chat.tsx      # Education-specific configuration
├── HealthV0Chat.tsx         # Health-specific configuration
├── BusinessV0Chat.tsx       # Business-specific configuration
├── SustainabilityV0Chat.tsx # Sustainability-specific configuration
└── index.ts                 # Exports
```

### Page Structure

```
app/
├── education/studio/
│   ├── layout.tsx           # Full-screen layout
│   └── page.tsx             # Education studio page
├── health/studio/
│   ├── layout.tsx
│   └── page.tsx
├── business/studio/
│   ├── layout.tsx
│   └── page.tsx
└── sustainability/studio/
    ├── layout.tsx
    └── page.tsx
```

## Domain Configurations

### 1. Education Studio

**Purpose:** Create interactive learning content, quizzes, educational apps

**Example Prompts:**
- Create an interactive quiz on the water cycle
- Build a multiplication practice game for 3rd graders
- Design a timeline explorer for World War II
- Make a periodic table with element details
- Create a typing tutor for beginners
- Build a flashcard app for vocabulary learning

**System Prompt:** Focuses on pedagogy, age-appropriate content, interactive elements, visual aids, and gamification.

### 2. Health Studio

**Purpose:** Build health tracking apps, medical dashboards, wellness tools

**Example Prompts:**
- Build a medication tracker with reminders
- Create a symptom checker interface
- Design a fitness and nutrition dashboard
- Make a patient appointment scheduler
- Build a mental health mood tracker
- Create a blood pressure log with charts

**System Prompt:** Emphasizes HIPAA-consciousness, privacy-first design, patient-centered UX, and medical disclaimers.

**⚠️ Important:** Always includes disclaimers that apps are for informational purposes only.

### 3. Business Studio

**Purpose:** Generate dashboards, analytics tools, CRM interfaces, business apps

**Example Prompts:**
- Create a sales dashboard with KPI metrics
- Build a customer relationship manager
- Design an invoice generator and tracker
- Make a project management kanban board
- Create an employee performance tracker
- Build a financial forecasting dashboard

**System Prompt:** Focuses on professional aesthetics, data visualization, business intelligence, and enterprise features.

### 4. Sustainability Studio

**Purpose:** Create carbon tracking apps, ESG reporting tools, environmental dashboards

**Example Prompts:**
- Build a carbon footprint calculator
- Create an ESG reporting dashboard
- Design a renewable energy tracker
- Make a waste reduction tracker for businesses
- Create a sustainability goals progress tracker
- Build a water usage monitoring dashboard

**System Prompt:** Emphasizes environmental metrics, carbon calculations, ESG reporting, and eco-friendly design.

## Usage

### Basic Flow

1. **Navigate** to a studio URL (e.g., `/education/studio`)
2. **Click** an example prompt or type your own request
3. **Watch** as v0 generates the content in real-time
4. **View** the live preview in the right panel
5. **Continue** the conversation to refine the content

### With Authentication

- **Anonymous Users:** 3 chats per day (tracked by IP)
- **Guest Users:** 5 chats per day (persistent session)
- **Registered Users:** 50 chats per day (full persistence)

Authenticated users can:
- See their recent chats in the top bar
- Click to reload previous conversations
- View all their projects and chats across devices

### Message Flow

1. User sends prompt via `PromptInput`
2. Message immediately appears in `Conversation`
3. API creates/continues v0 chat
4. Assistant response rendered in `Message` component
5. Preview URL updated in `WebPreview`
6. Chat saved to database with ownership tracking

## API Integration

### Endpoints Used

All studios use the same backend API:

- **`POST /api/textbook-studio/chats`** - Create new chat
- **`POST /api/textbook-studio/chats/[chatId]`** - Send message
- **`GET /api/textbook-studio/chats`** - List user's chats
- **`GET /api/textbook-studio/chats/[chatId]`** - Get chat details

### v0 SDK Integration

```typescript
import { v0 } from "v0-sdk";

// Create chat with custom system prompt
const chat = await v0.chats.create({
  message: userMessage,
  system: domainSpecificSystemPrompt,
});

// Continue existing chat
const response = await v0.chats.sendMessage({
  chatId: chatId,
  message: userMessage,
});
```

## Comparison with Documentation

### ✅ What's Implemented (Per Docs)

| Feature | Status | Notes |
|---------|--------|-------|
| AI Elements Components | ✅ | All official components used |
| Conversation/Message | ✅ | Proper message structure |
| PromptInput | ✅ | Advanced input with attachments support |
| Suggestions | ✅ | Example prompts as cards |
| WebPreview | ✅ | Live preview with navigation |
| Loader | ✅ | AI Elements loader component |
| Split-screen layout | ✅ | Chat left, preview right |
| Authentication | ✅ | NextAuth with multi-tenant |
| Rate limiting | ✅ | Per user type (anon/guest/registered) |
| Chat persistence | ✅ | Database ownership tracking |
| Domain-specific prompts | ✅ | 4 specialized versions |

### ⚠️ Not Yet Implemented (Future)

| Feature | Status | Notes |
|---------|--------|-------|
| Streaming responses | ❌ | Requires `responseMode: 'experimental_stream'` |
| StreamingMessage | ❌ | From `@v0-sdk/react` |
| Task rendering | ❌ | task-thinking-v1, task-search-web-v1, etc. |
| Multiple generations | ❌ | A/B/C options like v0.dev |
| Version history | ❌ | Track iterations of same chat |
| Code export | ❌ | Export to CodeSandbox/StackBlitz |

## Extending the System

### Adding a New Domain

1. **Create component** in `components/v0-studio/NewDomainV0Chat.tsx`:

```typescript
"use client";

import { BaseV0Chat } from "./BaseV0Chat";
import { YourIcon } from "lucide-react";

export function NewDomainV0Chat() {
  return (
    <BaseV0Chat
      title="New Domain Studio"
      subtitle="AI-Powered [Domain] Content"
      icon={<YourIcon className="h-5 w-5 text-primary" />}
      examplePrompts={[
        "Example 1",
        "Example 2",
        "Example 3",
      ]}
      systemPrompt="Your domain-specific instructions..."
      emptyStateTitle="What should we build?"
      emptyStateDescription="Describe your content..."
    />
  );
}
```

2. **Export** from `components/v0-studio/index.ts`
3. **Create page** at `app/new-domain/studio/page.tsx`
4. **Create layout** at `app/new-domain/studio/layout.tsx`

### Customizing Behavior

The `BaseV0Chat` component accepts these props:

```typescript
interface BaseV0ChatProps {
  className?: string;               // Custom styling
  title: string;                    // Header title
  subtitle?: string;                // Header subtitle
  icon?: React.ReactNode;           // Header icon
  examplePrompts: string[];         // Suggestion cards
  systemPrompt?: string;            // v0 system instructions
  emptyStateTitle?: string;         // Empty state heading
  emptyStateDescription?: string;   // Empty state description
}
```

## Technical Details

### AI Elements Benefits

Using official AI Elements provides:
- Consistent UX matching v0.dev
- Proper TypeScript types
- Accessibility built-in
- Responsive design
- Theme support (light/dark)
- Professional polish

### Database Schema

```sql
-- Chat ownership tracking
CREATE TABLE chat_ownership (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  v0_chat_id VARCHAR(255) NOT NULL,
  v0_project_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Anonymous rate limiting
CREATE TABLE anonymous_chat_log (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  v0_chat_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Security Features

- ✅ SQL injection protection via parameterized queries
- ✅ User data isolation through ownership checks
- ✅ Rate limiting per user type
- ✅ Secure session cookies via NextAuth
- ✅ CSRF protection
- ✅ IP-based anonymous tracking

## Development

### Running Locally

```bash
# Start dev server
pnpm dev

# Access studios
open http://localhost:3001/education/studio
open http://localhost:3001/health/studio
open http://localhost:3001/business/studio
open http://localhost:3001/sustainability/studio
```

### Environment Variables

Required in `.env.local`:

```bash
# v0 Platform API
V0_API_KEY=your_v0_api_key

# NextAuth
NEXTAUTH_SECRET=your_auth_secret

# Database
POSTGRES_URL=your_postgres_connection_string
```

Get your v0 API key from: [https://v0.dev/chat/settings/keys](https://v0.dev/chat/settings/keys)

## Troubleshooting

### Common Issues

**Preview not loading:**
- Check v0 API key is valid
- Verify chat was created successfully
- Check browser console for errors

**Authentication issues:**
- Verify NEXTAUTH_SECRET is set
- Check database connection
- Ensure session cookies are enabled

**Rate limiting:**
- Anonymous users: Check IP address
- Registered users: Verify user ID in database
- Check `chat_ownership` and `anonymous_chat_log` tables

**AI Elements not rendering:**
- Verify `@v0-sdk/react` is installed
- Check component imports
- Ensure Tailwind CSS is configured

## Resources

- [v0 Platform API Docs](https://v0.dev/docs/api/platform)
- [AI Elements Components](https://v0.dev/docs/ai-elements)
- [v0 SDK GitHub](https://github.com/vercel/v0-sdk)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT

---

**Built with:**
- Next.js 15.3.1
- v0-sdk 0.15.0
- AI Elements (official v0 components)
- NextAuth 4.24.13
- PostgreSQL (Neon)
- Tailwind CSS
