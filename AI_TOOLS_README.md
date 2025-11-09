# AI Tools Integration Guide

## Overview

Your Augment Demo now has three powerful tools that allow the LLM to create rich, interactive experiences:

1. **displayArtifact** - Display code, documents, and structured content in a clean container
2. **displayWebPreview** - Show live previews of web pages with navigation controls  
3. **generateHtmlPreview** - Create and display interactive HTML/CSS/JavaScript content

## What Was Implemented

### Components Created

#### 1. Artifact Component (`components/ai-elements/artifact.tsx`)
A composable component system for displaying content with actions:
- `Artifact` - Main container
- `ArtifactHeader` - Header with title and actions
- `ArtifactTitle` / `ArtifactDescription` - Text elements
- `ArtifactActions` / `ArtifactAction` - Action buttons with tooltips
- `ArtifactContent` - Content area

#### 2. Web Preview Component (`components/ai-elements/web-preview.tsx`)
A full-featured web preview component:
- `WebPreview` - Main container with navigation state
- `WebPreviewNavigation` - Navigation bar
- `WebPreviewUrl` - URL input with back/forward/refresh controls
- `WebPreviewBody` - Iframe for content display
- `WebPreviewConsole` - Console panel for logging

#### 3. Tooltip Component (`components/ui/tooltip.tsx`)
Radix UI-based tooltip for action buttons.

### Backend Integration

#### Tools (`lib/tools.ts`)
Three AI tools defined with Zod schemas:
- Input validation
- Type-safe execution
- Clear descriptions for the LLM

#### Chat Route (`app/api/chat/route.ts`)
- Tools added to `streamText` call
- Enhanced system prompt explaining when and how to use each tool
- Proper error handling

#### Agent Orchestration (`lib/agents/*`)
- `lib/agents/chat-agent.ts` and `lib/agents/health-agent.ts` wrap the AI SDK `Experimental_Agent` class
- Each helper resolves the correct model (Cerebras vs Gateway), injects the shared system prompts, and wires in the relevant tools
- API routes reuse these helpers so the same agent configuration can power REST endpoints, streaming responses, or future UI surfaces without duplicating logic

#### Chat Component (`components/chat.tsx`)
- Renders tool outputs as React components
- Three renderer components:
  - `ArtifactRenderer` - With copy/download actions
  - `WebPreviewRenderer` - With iframe navigation
  - `HtmlPreviewRenderer` - With preview/code toggle
- Loading states for each tool
- Proper styling and responsive design

## How to Use

### 1. Start the Development Server

```bash
pnpm dev
```

### 2. Try These Example Prompts

**For Code Artifacts:**
```
Show me a Python function to calculate fibonacci numbers
```

**For Web Previews:**
```
Show me the Vercel AI SDK documentation
```

**For HTML Previews:**
```
Create an interactive calculator with HTML, CSS, and JavaScript
```

```
Build a simple todo list app using vanilla JavaScript
```

```
Create an animated loading spinner using CSS
```

## How the LLM Uses These Tools

The LLM has been instructed via the system prompt to use these tools automatically when appropriate. It understands:

### When to Use displayArtifact
- User asks for code examples
- Sharing configuration files  
- Displaying structured text
- Content doesn't need to be interactive

### When to Use displayWebPreview
- User asks to see an existing website
- Referencing online documentation
- Showing external resources

### When to Use generateHtmlPreview
- User asks to create a UI component
- Building interactive demos
- Creating visualizations
- Content should be executable/interactive

## Features Implemented

### Artifact Renderer
✅ Copy to clipboard functionality
✅ Download as file
✅ Syntax highlighting for code
✅ Support for multiple content types (code, text, markdown, html)
✅ Optional title and description
✅ Responsive design

### Web Preview Renderer  
✅ Full navigation controls (back, forward, refresh)
✅ URL input bar
✅ History management
✅ Responsive iframe
✅ Loading states
✅ Optional title and description

### HTML Preview Renderer
✅ Live preview in iframe
✅ Toggle between preview and code view
✅ Copy HTML source code
✅ Full HTML/CSS/JavaScript support
✅ Data URL encoding for secure rendering
✅ Optional title and description

## Technical Details

### Type Safety
- All components are fully typed with TypeScript
- Tool inputs validated with Zod schemas
- Proper type assertions for tool outputs

### Styling
- Uses Tailwind CSS for consistent styling
- Follows shadcn/ui design patterns
- Dark mode support via next-themes
- Responsive layouts

### Accessibility
- ARIA labels on all buttons
- Tooltips for action buttons
- Keyboard navigation support
- Screen reader friendly

### Security
- HTML previews use data URLs (sandboxed)
- XSS protection through React's built-in escaping
- No eval() or dangerous innerHTML usage

## Example User Interactions

### Example 1: Code Request
```
User: Can you show me how to implement a debounce function in JavaScript?

AI: [Uses displayArtifact tool]
- Shows code with syntax highlighting
- User can copy or download the code
- Clean presentation with title and description
```

### Example 2: Web Resource
```
User: Show me the React documentation for hooks

AI: [Uses displayWebPreview tool]
- Opens React docs in iframe
- User can navigate within the preview
- Back/forward buttons work
- Can change URL if needed
```

### Example 3: Interactive Demo
```
User: Create a simple stopwatch with start/stop/reset buttons

AI: [Uses generateHtmlPreview tool]
- Generates complete HTML/CSS/JS
- Shows live preview immediately
- User can toggle to see the code
- Can copy the code if needed
```

## Troubleshooting

### Issue: Tools Not Being Called
- Check that the model supports tool calling
- Some models may need explicit instructions
- Try being more specific in your prompts

### Issue: Preview Not Loading
- Check browser console for errors
- Some sites block iframe embedding (X-Frame-Options)
- Try a different URL

### Issue: Styling Issues
- Ensure Tailwind CSS is properly configured
- Check that dark mode classes are applied correctly
- Verify all dependencies are installed

## Next Steps

You can enhance these tools further:

1. **Add More Tools:**
   - Image generation/display tool
   - Chart/graph visualization tool
   - Data table display tool

2. **Enhance Existing Tools:**
   - Add syntax highlighting library (like Prism or Shiki)
   - Add markdown rendering for artifact content
   - Add console logging for HTML previews
   - Add mobile/tablet/desktop preview modes

3. **Improve UX:**
   - Add animation/transitions
   - Add fullscreen mode for previews
   - Add share/export functionality
   - Add version history for generated content

## Documentation

See `TOOLS_DOCUMENTATION.md` for detailed API documentation and best practices for the LLM to use these tools effectively.

## Support

For issues or questions:
1. Check TypeScript errors: `pnpm run type-check`
2. Check linter: `pnpm run lint`
3. Review console logs in browser dev tools
4. Refer to AI SDK documentation: https://sdk.vercel.ai/docs

