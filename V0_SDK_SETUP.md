# v0 SDK Integration - Setup Complete

## What Was Implemented

The v0 Studio components now use the official v0 SDK for professional site rendering and deployment support.

### Changes Made

1. **Created v0 SDK API Routes**
   - `/api/v0-chat` - Creates and continues v0 chats using the v0 SDK
   - `/api/v0-deploy` - Deploys v0 projects (for future use)

2. **Updated BaseV0Chat Component**
   - Replaced Cerebras code generation with v0 SDK
   - Changed preview panel to show iframe with v0-hosted demo URLs
   - Simplified chat flow using v0's professional generation

3. **Improved Preview Panel**
   - Uses AI Elements `WebPreview` component
   - Shows live v0-hosted site in iframe
   - "Open in New Tab" button to view full site
   - "Copy Code" button for generated files

## Setup Instructions

### 1. Get Your v0 API Key

1. Visit [v0.dev/chat/settings/keys](https://v0.dev/chat/settings/keys)
2. Create a new API key
3. Copy the key

### 2. Add to Environment Variables

Add to your `.env.local` file:

```bash
# v0 API Key (required for v0 Studio)
V0_API_KEY=your_v0_api_key_here
```

### 3. Restart Development Server

```bash
pnpm dev
```

## How to Use

### Access the v0 Studios

| Studio | URL | Best For |
|--------|-----|----------|
| 🎓 **Education** | [localhost:3000/education/studio](http://localhost:3000/education/studio) | Learning apps, quizzes, dashboards |
| ❤️ **Health** | [localhost:3000/health/studio](http://localhost:3000/health/studio) | Health trackers, medical apps |
| 💼 **Business** | [localhost:3000/business/studio](http://localhost:3000/business/studio) | Analytics, CRM, business tools |
| 🌱 **Sustainability** | [localhost:3000/sustainability/studio](http://localhost:3000/sustainability/studio) | Carbon tracking, ESG reports |

### Example Prompts

Try these to see v0 in action:

```
Create a responsive navigation bar with dark mode support
```

```
Build a todo app with React and TypeScript
```

```
Make a landing page for a coffee shop with hero section and menu
```

```
Create a dashboard with charts showing sales data
```

### Features

✅ **Professional v0 Generation**
- Industry-leading AI code generation
- Multi-file React projects
- Full Next.js setup
- v0's design system

✅ **Live Preview**
- Instant iframe preview
- v0-hosted demo URLs
- Open in new tab
- Copy generated code

✅ **Conversation History**
- Continue refining your app
- Iterate with follow-up messages
- Full chat history

✅ **Authentication Integration**
- Anonymous: 3 chats/day
- Registered: 50 chats/day
- Saved chat history

## How It Works

### 1. User sends a prompt
```
"Create a todo app"
```

### 2. API calls v0 SDK with sync mode
```typescript
const chat = await v0.chats.create({
  message: userMessage,
  responseMode: 'sync', // Important: Gets immediate response
  modelConfiguration: {
    modelId: 'v0-1.5-md', // Use medium model
  },
});
```

### 3. v0 returns hosted demo (synchronously)
```json
{
  "id": "chat_abc123",
  "demo": "https://demo-xyz.vusercontent.net",
  "files": [...],
  "messages": [...]
}
```

### 4. Preview shows in iframe
```tsx
<WebPreviewBody src={chat.demo} />
```

## API Endpoints

### POST /api/v0-chat

Create or continue a v0 chat.

**Request:**
```json
{
  "message": "Create a responsive navbar",
  "chatId": "chat_123" // optional, for continuing
}
```

**Response:**
```json
{
  "id": "chat_abc123",
  "demo": "https://v0.dev/chat/abc123",
  "files": [
    {
      "name": "app/page.tsx",
      "content": "..."
    }
  ]
}
```

### POST /api/v0-deploy

Deploy a v0 project (requires project setup).

**Request:**
```json
{
  "projectId": "proj_123",
  "chatId": "chat_123",
  "versionId": "ver_123"
}
```

## Benefits vs Previous Implementation

| Feature | Old (Cerebras) | New (v0 SDK) |
|---------|---------------|--------------|
| **Code Quality** | Basic generation | Professional, production-ready |
| **Preview** | CodeSandbox URL | v0-hosted demo |
| **Multi-file** | Single component | Full project structure |
| **Design System** | Basic Tailwind | v0's design system |
| **Iterations** | New generation each time | Conversation context |
| **Deployment** | Manual | v0 deployment API (future) |

## Troubleshooting

### Error: "V0_API_KEY not configured"

**Solution:** Add your v0 API key to `.env.local`:
```bash
V0_API_KEY=your_api_key_here
```

### Preview shows "Loading..."

**Possible causes:**
1. v0 is still generating (wait a few seconds)
2. API key is invalid (check your key)
3. Rate limit reached (wait or upgrade plan)

### Code not showing in preview

**This is expected** - v0 returns a hosted demo URL that shows the live app in an iframe. To see the code:
1. Click "Copy Code" button (if generated files available)
2. Or visit the demo URL and use v0's code viewer

## Next Steps

### Optional: Enable Deployment

To enable full deployment functionality:

1. Set up v0 projects:
```typescript
const project = await v0.projects.create({
  name: 'My App',
});
```

2. Add deployment button to UI
3. Call `/api/v0-deploy` endpoint

### Resources

- [v0 Platform API Documentation](https://v0.dev/docs/api/platform)
- [v0 SDK GitHub](https://github.com/vercel/v0-sdk)
- [v0 Quickstart Guide](https://v0.dev/docs/api/platform/quickstart)
- [Get v0 API Key](https://v0.dev/chat/settings/keys)

## Summary

Your v0 Studio is now powered by the official v0 SDK! 🎉

- Professional-quality code generation
- Live hosted previews in iframe
- Conversation-based iteration
- Full v0 Platform API integration

Start building amazing apps with natural language!

