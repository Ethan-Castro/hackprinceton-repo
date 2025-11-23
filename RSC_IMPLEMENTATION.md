# AI SDK RSC Implementation Guide

## Overview

This document describes the complete AI SDK RSC (React Server Components) implementation across your application. RSC enables streaming React components directly from the server with full AI/UI state management.

## What is RSC?

React Server Components allow you to:
- Stream React components directly from server to client
- Manage both AI State (server-side conversation history) and UI State (client-side rendered components)
- Build interactive, multi-step interfaces with full type safety
- Execute Server Actions directly from client components

## Architecture

### File Structure

```
app/rsc/
├── layout.tsx              # RSC layout with AI context provider
├── page.tsx                # Main RSC chat page with full UI
├── ai.ts                   # AI context configuration (createAI)
├── actions.ts              # Server Actions and streaming functions
└── components/
    └── BusinessAnalysisPanel.tsx  # Interactive multi-step UI
```

### Key Components

#### 1. **RSC Actions** (`app/rsc/actions.ts`)
Defines all Server Actions that can be called from the client:

- `sendMessage(input, modelId, useBusinessTools)` - Stream text responses
- `generateBusinessPlan(...)` - Generate business plans with streaming UI
- `generateFinancialProjections(...)` - Generate financial analysis
- `generateMarketAnalysis(...)` - Generate market research

Each action:
- Runs on the server (marked with `'use server'`)
- Can call AI SDK functions (`streamText`, `generateObject`)
- Returns React components or `ReactNode`
- Has full access to backend resources

#### 2. **AI Context** (`app/rsc/ai.ts`)
Configures the AI context using `createAI`:

```typescript
export const AI = createAI<AIState, UIState>({
  initialAIState: [],      // Start with empty conversation
  initialUIState: [],      // Start with no rendered components
  actions: {
    sendMessage,
    generateBusinessPlan,
    generateFinancialProjections,
    generateMarketAnalysis,
  },
});
```

This context:
- Manages conversation history (AI State)
- Tracks rendered components (UI State)
- Provides type-safe access to Server Actions
- Syncs state between client and server

#### 3. **RSC Layout** (`app/rsc/layout.tsx`)
Wraps the page with the AI context provider:

```typescript
export default function RSCLayout({ children }) {
  return <AI>{children}</AI>;  // Enables AI/UI state and actions
}
```

#### 4. **Chat Page** (`app/rsc/page.tsx`)
Main interface demonstrating:
- Three chat modes: General, Business Analyst, Analysis Tools
- Model selection dropdown
- Message history rendering
- Input form for sending messages
- Integration with BusinessAnalysisPanel

#### 5. **Business Analysis Panel** (`app/rsc/components/BusinessAnalysisPanel.tsx`)
Interactive component demonstrating:
- Multi-step interface (tabs for different analysis types)
- Form inputs for each analysis type
- Real-time updates with `useUIState`
- Server Action calls with `useActions`
- Streaming component rendering

## How It Works

### Basic Flow

1. **User Input**: User types message and hits send
2. **Server Action Call**: Client calls `sendMessage()` via `useActions`
3. **Server Processing**:
   - Server receives message
   - Calls AI SDK `streamText()` or `generateObject()`
   - Model processes with available tools
4. **Component Streaming**: Server returns React components
5. **UI Update**: Components are streamed to client
6. **State Management**: AI State and UI State automatically sync

### Detailed Example: Business Plan Generation

```typescript
// 1. User submits form
const handleGenerateBusinessPlan = async (e) => {
  const result = await generateBusinessPlan(
    formData.companyName,
    formData.businessDescription,
    formData.targetMarket
  );
  // ...
};

// 2. Server Action executes (in actions.ts)
export async function generateBusinessPlan(
  companyName: string,
  businessDescription: string,
  targetMarket: string,
  modelId: string
): Promise<ReactNode> {
  'use server';

  // Generate business plan using AI SDK
  const plan = await generateBusinessPlanSafe(model, {
    companyName,
    businessDescription,
    targetMarket,
  });

  // Return React component
  return (
    <BusinessPlanComponent
      companyName={plan.companyName}
      executiveSummary={plan.executiveSummary}
      sections={plan.sections}
    />
  );
}

// 3. Component rendered on client
setMessages((prev) => [...prev, result]);
```

## Usage: How to Use RSC in Your Application

### For Regular Chat

1. Navigate to `/rsc`
2. Select "General Chat" or "Business Analyst"
3. Type messages and hit send
4. Responses stream back as components

### For Structured Analysis

1. Navigate to `/rsc`
2. Click "Analysis Tools" tab
3. Select analysis type (Business Plan, Financial, Market)
4. Fill in the form
5. Click "Generate..." button
6. Results appear below the form

### Using from Other Components

```typescript
'use client';

import { useActions } from '@ai-sdk/rsc';
import { AI } from '@/app/rsc/ai';

export function MyComponent() {
  const { sendMessage } = useActions<typeof AI>();

  const handleClick = async () => {
    const response = await sendMessage("Hello!");
    console.log(response); // React component
  };

  return <button onClick={handleClick}>Ask AI</button>;
}
```

## State Management

### AI State (Server-side)
Stores conversation history and context:
```typescript
type AIState = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolName?: string;
}[];
```

**Usage**:
- Persistent conversation context for the model
- Sent to LLM on each request
- Updated via `getMutableAIState()`

### UI State (Client-side)
Stores rendered components:
```typescript
type UIState = {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
  metadata?: {...};
}[];
```

**Usage**:
- Rendered on the client
- Updated via `setMessages()` from `useUIState()`
- Can store React elements (not serializable)

### Accessing State

**In Server Actions**:
```typescript
import { getMutableAIState } from '@ai-sdk/rsc';

export async function myAction(input: string) {
  'use server';

  const aiState = getMutableAIState();
  const history = aiState.get(); // Read state

  // Process...

  aiState.done([...history, newMessage]); // Update state
}
```

**In Client Components**:
```typescript
'use client';

import { useAIState, useUIState } from '@ai-sdk/rsc';

export function MyComponent() {
  const [aiState] = useAIState();
  const [uiState, setUIState] = useUIState();

  // Use state...
}
```

## Hooks Reference

### `useActions<typeof AI>()`
Get access to all Server Actions:
```typescript
const { sendMessage, generateBusinessPlan } = useActions<typeof AI>();
const response = await sendMessage("Hello");
```

### `useUIState<typeof AI>()`
Get and update UI State (rendered components):
```typescript
const [messages, setMessages] = useUIState<typeof AI>();
setMessages([...messages, newComponent]);
```

### `useAIState<typeof AI>()`
Get and update AI State (conversation history):
```typescript
const [aiState, setAIState] = useAIState<typeof AI>();
// Read-only in components, updated in actions
```

## API Endpoint

### POST `/api/rsc-chat`
Bridge endpoint for traditional API-based chat:

**Request**:
```json
{
  "messages": [{...}],
  "modelId": "claude-3-5-sonnet-20241022",
  "useBusinessTools": false
}
```

**Response**: Text stream (can be enhanced for component streaming)

**Usage**: For integrating with existing chat interfaces

## Advanced Patterns

### Multi-Step Interface Example

The `BusinessAnalysisPanel` demonstrates:
1. Tab-based navigation for different analysis types
2. Dynamic form based on selected analysis
3. Form submission → Server Action call
4. Result rendering in UI State

### Error Handling

All Server Actions include error boundaries:
```typescript
try {
  const result = await generateBusinessPlan(...);
  return result;
} catch (error: any) {
  return (
    <div className="error">
      <p>Error: {error.message}</p>
    </div>
  );
}
```

### Streaming Components

Using AI SDK's streaming with RSC:
```typescript
const result = await streamUI({
  model,
  prompt: userInput,
  text: ({ content }) => <div>{content}</div>,
  tools: {
    myTool: {
      description: "...",
      inputSchema: z.object({...}),
      generate: async function* ({ param }) {
        yield <LoadingComponent />;
        const data = await fetchData(param);
        return <ResultComponent data={data} />;
      }
    }
  }
});
return result.value;
```

## Integration with Existing Code

### Current Capabilities
- ✅ Structured data generation (`generateObject`)
- ✅ Tool execution framework with retry logic
- ✅ Error handling and circuit breaker patterns
- ✅ Business analysis tools

### New RSC Capabilities
- ✅ Streaming React components to client
- ✅ AI/UI state management
- ✅ Server Actions for interactivity
- ✅ Multi-step interfaces
- ✅ Type-safe component streaming

### Migration Path

**Option 1: Use RSC Page**
- Direct users to `/rsc` for RSC-powered chat
- Keep existing endpoints as fallback

**Option 2: Hybrid Approach**
- Update existing `/api/chat` to support both patterns
- Add RSC components to existing pages
- Gradually migrate to full RSC

**Option 3: Complete Migration**
- Refactor all chat endpoints to use RSC actions
- Deprecate non-RSC endpoints
- Unified RSC-based experience

## Performance Considerations

### Streaming Benefits
- Components appear progressively
- Faster perceived performance
- Better UX for long generations

### State Management
- AI State kept minimal (just text)
- UI State can store large components
- Automatic garbage collection

### Caching
- Structured data cached with tool executor
- RSC components not cached (regenerated each time)
- User-level caching could be added via persistence

## Security Considerations

### Server Actions
- Only run on server (no client-side execution)
- Have full access to backend resources
- Should validate all inputs
- Can access environment variables

### State Serialization
- AI State is serializable JSON
- UI State can contain non-serializable React elements
- Never store sensitive data in client-accessible state

## Future Enhancements

### Planned Improvements
1. **Persistence**: Save/restore chat history
2. **Database Integration**: Store conversations in DB
3. **Streaming Object Generation**: Use `streamObject()` for progressive data
4. **Real-time Collaboration**: Multiple users on same conversation
5. **Component Library**: Pre-built analysis components
6. **Theme Customization**: User-defined styling for components

### Integration Opportunities
1. **MCP Integration**: Use MCP tools in RSC
2. **Vector Search**: RAG-enhanced responses
3. **Analytics**: Track component usage and interactions
4. **A/B Testing**: Different component variations

## Troubleshooting

### Issue: Components not rendering
**Solution**: Ensure component is returned as `ReactNode` not wrapped in error boundary

### Issue: State not persisting
**Solution**: Implement `onGetUIState` and `onSetAIState` callbacks in `createAI` config

### Issue: Actions not available
**Solution**: Verify component is wrapped with `<AI>` provider and has `'use client'` directive if needed

### Issue: Streaming feels slow
**Solution**: Return loading component early, then update with actual data using `yield`

## Examples

### Example 1: Simple Chat
See `/app/rsc/page.tsx` - Basic chat with streaming responses

### Example 2: Multi-step Analysis
See `/app/rsc/components/BusinessAnalysisPanel.tsx` - Interactive form-based analysis

### Example 3: Server Action
See `/app/rsc/actions.ts` - All streaming actions with error handling

### Example 4: Custom Component
See `BusinessPlanComponent` in `/app/rsc/actions.ts` - Styled analysis display

## References

- [AI SDK RSC Docs](https://sdk.vercel.ai/docs/ai-sdk-rsc)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

---

## Quick Start Checklist

- [x] AI context created (`app/rsc/ai.ts`)
- [x] Server actions defined (`app/rsc/actions.ts`)
- [x] RSC page implemented (`app/rsc/page.tsx`)
- [x] Interactive components created (`app/rsc/components/`)
- [x] Layout with provider (`app/rsc/layout.tsx`)
- [x] API endpoint for integration (`app/api/rsc-chat/route.ts`)
- [x] Documentation complete

Visit `/rsc` to see RSC in action!
