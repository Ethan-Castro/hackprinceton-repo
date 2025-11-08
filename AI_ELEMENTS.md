# AI Elements Components

This project now includes AI Elements components for enhanced UI interactions with AI-generated content.

## Installed Components

### 1. Shimmer
An animated text shimmer component for creating eye-catching loading states and progressive reveal effects.

```tsx
import { Shimmer } from '@/components/ai-elements';

<Shimmer duration={2}>Loading content...</Shimmer>
```

**Props:**
- `children`: The text content to apply the shimmer effect to (required)
- `as`: The HTML element to render (default: `"p"`)
- `duration`: Animation duration in seconds (default: `2`)
- `spread`: Spread multiplier for shimmer gradient (default: `2`)

### 2. Plan
A collapsible plan component for displaying AI-generated execution plans with streaming support.

```tsx
import {
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanTrigger,
  PlanContent,
} from '@/components/ai-elements';

<Plan isStreaming={isLoading} defaultOpen>
  <PlanHeader>
    <PlanTrigger />
    <div className="flex-1">
      <PlanTitle>Generate React Component</PlanTitle>
      <PlanDescription>Creating a new component with TypeScript</PlanDescription>
    </div>
  </PlanHeader>
  <PlanContent>
    <div>Plan details go here...</div>
  </PlanContent>
</Plan>
```

**Key Features:**
- Collapsible content with smooth animations
- Streaming support with shimmer loading states
- Built on shadcn/ui Card and Collapsible components
- Automatic shimmer animation when `isStreaming` is true

### 3. Task
A collapsible task list component for displaying AI workflow progress with status indicators.

```tsx
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from '@/components/ai-elements';

<Task defaultOpen>
  <TaskTrigger 
    title="Install dependencies"
    status="completed"
  />
  <TaskContent>
    <TaskItem>
      Run npm install
    </TaskItem>
    <TaskItem>
      Created <TaskItemFile>package.json</TaskItemFile>
    </TaskItem>
  </TaskContent>
</Task>
```

**Status Types:**
- `pending`: Gray circle icon
- `in_progress`: Blue spinning loader
- `completed`: Green checkmark
- `error`: Red X icon

## Usage in Chat Interface

These components can be used to enhance the chat interface when working with AI responses. For example:

1. **Showing AI thinking process** - Use the Plan component with `isStreaming` to show the AI's planning phase
2. **Displaying multi-step workflows** - Use the Task component to show progress on multi-step operations
3. **Loading states** - Use Shimmer for text that's being generated

## Example: Enhanced Chat Message

```tsx
'use client';

import { useChat } from 'ai/react';
import { Plan, PlanHeader, PlanTitle, PlanTrigger, PlanContent } from '@/components/ai-elements';

export function Chat() {
  const { messages, isLoading } = useChat();

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'assistant' && (
            <Plan isStreaming={isLoading}>
              <PlanHeader>
                <PlanTrigger />
                <PlanTitle>AI Response</PlanTitle>
              </PlanHeader>
              <PlanContent>
                {message.content}
              </PlanContent>
            </Plan>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Dependencies

The AI Elements components require:
- `framer-motion` - For animations (already installed)
- `@radix-ui/react-collapsible` - For collapsible functionality (already included via shadcn/ui)
- `lucide-react` - For icons (already installed)

All dependencies have been installed and configured.

## Integration with AI SDK

These components work seamlessly with Vercel's AI SDK:

1. **With `useChat`** - Display streaming responses with shimmer effects
2. **With `useObject`** - Display structured task workflows
3. **With `streamText`** - Show progressive plan reveals

## Styling

All components use Tailwind CSS and support the project's theme system, including dark mode. They're fully customizable through:
- `className` prop
- Tailwind utility classes
- CSS custom properties

## Accessibility

All components include:
- Keyboard navigation support
- Screen reader labels
- ARIA attributes
- Focus management

## Files Created

- `/components/ai-elements/shimmer.tsx` - Shimmer component
- `/components/ai-elements/plan.tsx` - Plan component
- `/components/ai-elements/task.tsx` - Task component
- `/components/ai-elements/index.ts` - Barrel export

