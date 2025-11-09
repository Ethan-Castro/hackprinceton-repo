# AI Elements Implementation Guide

This guide provides step-by-step instructions to implement the missing AI Elements components in your codebase.

---

## 1. Add Chain of Thought Component

**File**: `components/chat.tsx`

### Step 1: Add Import
```tsx
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from "@/components/ai-elements";
```

### Step 2: Add Case Handler in Message Parts Switch
```tsx
case "chain-of-thought":
  return (
    <ChainOfThought
      key={`${m.id}-${i}`}
      defaultOpen={true}
      className="my-4"
    >
      <ChainOfThoughtHeader>Problem Solving Process</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {/* Parse and render chain of thought steps from part.text */}
        {renderChainOfThoughtSteps(part.text)}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
  break;
```

### Step 3: Add Helper Function
```tsx
function renderChainOfThoughtSteps(text: string) {
  // Parse the reasoning text into structured steps
  // This depends on your model's output format
  const steps = text.split('\n').filter(line => line.trim());
  return steps.map((step, idx) => (
    <ChainOfThoughtStep
      key={idx}
      label={`Step ${idx + 1}`}
      description={step}
      status={idx === steps.length - 1 ? "active" : "complete"}
    />
  ));
}
```

---

## 2. Add Sources Component

**File**: `components/chat.tsx`

### Step 1: Add Import
```tsx
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements";
```

### Step 2: Add State Management
```tsx
// In Chat component state
const [sources, setSources] = useState<Array<{ url: string; title?: string }>>([]);
```

### Step 3: Add Case Handler for Source Parts
```tsx
case "source-url":
  // Collect all source parts from message
  const sourceUrls = m.parts
    .filter(p => p.type === "source-url")
    .map(p => ({
      url: (p as any).url,
      title: (p as any).title || new URL((p as any).url).hostname,
    }));

  if (sourceUrls.length > 0) {
    return (
      <Sources key={`${m.id}-sources`} defaultOpen={false}>
        <SourcesTrigger count={sourceUrls.length} />
        <SourcesContent>
          {sourceUrls.map((source, idx) => (
            <Source
              key={idx}
              href={source.url}
              title={source.title}
            >
              {source.title}
            </Source>
          ))}
        </SourcesContent>
      </Sources>
    );
  }
  break;
```

### Step 4: Update Backend (if needed)
In your API routes, ensure they send source-url parts:
```tsx
// app/api/chat/route.ts
return result.toUIMessageStreamResponse({
  sendSources: true, // Enable sending sources
});
```

---

## 3. Add Response Component (Advanced Markdown)

**File**: `components/chat.tsx`

### Step 1: Add Import
```tsx
import { Response } from "@/components/ai-elements";
```

### Step 2: Replace ReactMarkdown
**Before**:
```tsx
case "text":
  return (
    <div key={`${m.id}-${i}`} className="prose prose-sm dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {part.text}
      </ReactMarkdown>
    </div>
  );
```

**After**:
```tsx
case "text":
  return (
    <Response
      key={`${m.id}-${i}`}
      className="prose prose-sm dark:prose-invert max-w-none"
    >
      {part.text}
    </Response>
  );
```

### Benefits
- ✅ Better streaming support
- ✅ Math equation rendering (KaTeX)
- ✅ Improved code block styling
- ✅ Better GitHub Flavored Markdown support

---

## 4. Add Tool Component

**File**: `components/chat.tsx`

### Step 1: Add Import
```tsx
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements";
```

### Step 2: Update Tool Rendering
**Before**:
```tsx
if (part.type.startsWith("tool-") && "state" in part) {
  const toolName = part.type.replace("tool-", "");
  return (
    <GenericToolRenderer
      key={`${m.id}-${i}`}
      data={{...}}
    />
  );
}
```

**After**:
```tsx
if (part.type.startsWith("tool-") && "state" in part) {
  const toolName = part.type.replace("tool-", "");
  const state = part.state as "input-available" | "output-available" | "error";
  
  return (
    <Tool key={`${m.id}-${i}`} className="my-4">
      <ToolHeader title={toolName} status={state} />
      <ToolContent>
        {state === "input-available" && "args" in part && (
          <ToolInput>
            {JSON.stringify(part.args, null, 2)}
          </ToolInput>
        )}
        {state === "output-available" && "output" in part && (
          <ToolOutput>
            {typeof part.output === "string"
              ? part.output
              : JSON.stringify(part.output, null, 2)}
          </ToolOutput>
        )}
        {state === "error" && "errorText" in part && (
          <ToolOutput error>
            {part.errorText as string}
          </ToolOutput>
        )}
      </ToolContent>
    </Tool>
  );
}
```

---

## 5. Add Context Component (Token Usage)

**File**: `components/chat.tsx`

### Step 1: Add Import
```tsx
import {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextContentFooter,
} from "@/components/ai-elements";
```

### Step 2: Add State for Token Tracking
```tsx
const [tokenUsage, setTokenUsage] = useState({
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  estimatedCost: 0,
});
```

### Step 3: Calculate Token Usage from Message Parts
```tsx
useEffect(() => {
  const inputTokens = messages
    .filter(m => m.role === "user")
    .reduce((sum, m) => sum + (m.parts?.[0]?.text?.length || 0) / 4, 0);
  
  const outputTokens = messages
    .filter(m => m.role === "assistant")
    .reduce((sum, m) => sum + (m.parts?.[0]?.text?.length || 0) / 4, 0);
  
  setTokenUsage({
    inputTokens: Math.round(inputTokens),
    outputTokens: Math.round(outputTokens),
    totalTokens: Math.round(inputTokens + outputTokens),
    estimatedCost: Math.round((inputTokens * 0.0005 + outputTokens * 0.0015) * 100) / 100,
  });
}, [messages]);
```

### Step 4: Add to UI (near Model Selector)
```tsx
<div className="flex items-center gap-2">
  <ModelSelectorHandler {...props} />
  
  {/* Add Context Component */}
  {messages.length > 0 && (
    <Context>
      <ContextTrigger>
        Tokens: {tokenUsage.totalTokens}
      </ContextTrigger>
      <ContextContent>
        <ContextContentHeader progress={(tokenUsage.totalTokens / 4000) * 100} />
        <ContextInputUsage tokens={tokenUsage.inputTokens} />
        <ContextOutputUsage tokens={tokenUsage.outputTokens} />
        <ContextContentFooter>
          Est. Cost: ${tokenUsage.estimatedCost}
        </ContextContentFooter>
      </ContextContent>
    </Context>
  )}
</div>
```

---

## 6. Add Inline Citation Support

**File**: `components/chat.tsx` (in the Response/Markdown section)

### Step 1: Add Import
```tsx
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationSource,
  InlineCitationQuote,
} from "@/components/ai-elements";
```

### Step 2: Create Citation Renderer Component
```tsx
function renderCitedText(text: string, citations: Array<{ id: string; url: string; quote: string }>) {
  // Parse text for citation markers (e.g., [1], [2])
  // Replace with InlineCitation components
  
  const citationPattern = /\[(\d+)\]/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = citationPattern.exec(text)) !== null) {
    parts.push(text.substring(lastIndex, match.index));
    
    const citationIndex = parseInt(match[1]) - 1;
    const citation = citations[citationIndex];
    
    if (citation) {
      parts.push(
        <InlineCitation key={`citation-${citationIndex}`}>
          <InlineCitationCard>
            <InlineCitationCardTrigger>{match[1]}</InlineCitationCardTrigger>
            <InlineCitationCardBody>
              <InlineCitationSource href={citation.url} title={citation.url}>
                {new URL(citation.url).hostname}
              </InlineCitationSource>
              <InlineCitationQuote>{citation.quote}</InlineCitationQuote>
            </InlineCitationCardBody>
          </InlineCitationCard>
        </InlineCitation>
      );
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  parts.push(text.substring(lastIndex));
  return parts;
}
```

---

## 7. Update Education Studio

**File**: `components/education-studio.tsx`

### Add Chain of Thought for Complex Topics
```tsx
// After importing Reasoning components
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements";

// In message rendering
case "chain-of-thought":
  return (
    <ChainOfThought key={`${message.id}-${index}`} defaultOpen>
      <ChainOfThoughtHeader>Learning Process</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {/* Render steps */}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
```

---

## 8. Update Business Chat

**File**: `components/business-chat.tsx`

### Add Sources for Research
```tsx
// Add to imports
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements";

// In message rendering - add source handling
case "source-url":
  // Similar to main chat implementation
  break;
```

---

## Testing Checklist

After implementing these changes:

- [ ] **Reasoning** - Test with DeepSeek R1 model
- [ ] **Chain of Thought** - Verify step-by-step reasoning displays
- [ ] **Sources** - Test with web search queries
- [ ] **Response** - Check markdown, code blocks, math rendering
- [ ] **Tool** - Verify tool invocation visualization
- [ ] **Context** - Check token counting accuracy
- [ ] **Inline Citation** - Test citation rendering in text
- [ ] **All chat modes** - Test in main, business, education chats

---

## Backend Updates

If your backend needs to support these components, update API routes:

### `app/api/chat/route.ts`
```tsx
return result.toUIMessageStreamResponse({
  sendReasoning: true,        // Enable reasoning parts
  sendSources: true,          // Enable source parts
  sendChainOfThought: true,   // Enable chain of thought
});
```

### Ensure Message Parts Include:
- `type: "reasoning"` - For thinking models
- `type: "source-url"` - For search results
- `type: "chain-of-thought"` - For reasoning steps
- `type: "tool-*"` - For tool invocations
- `type: "text"` - For main content

---

## Performance Considerations

1. **Memoization**: Wrap message renderers in `React.memo()` to prevent unnecessary re-renders
2. **Lazy Loading**: Consider lazy loading image components for sources
3. **Streaming**: Ensure streaming UI updates smoothly with `isStreaming` props
4. **Token Counting**: Use `js-tiktoken` for accurate token counting instead of character estimation

---

## Additional Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/)
- [AI Elements Documentation](https://sdk.vercel.ai/docs/ai-elements)
- Component source files in `components/ai-elements/`

