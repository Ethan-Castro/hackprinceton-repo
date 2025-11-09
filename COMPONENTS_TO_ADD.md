# Components to Add - Quick Reference

## 📝 File: `components/chat.tsx`

### Current Status
- ✅ Reasoning - Working perfectly
- ✅ Template - Working perfectly  
- ✅ Textbook - Working perfectly
- ✅ Artifacts - Working perfectly
- ✅ Web Preview - Working perfectly
- ⚠️ GenericToolRenderer - Basic, needs upgrade
- ❌ Sources - MISSING
- ❌ Chain of Thought - MISSING
- ❌ Response (advanced markdown) - MISSING
- ❌ Tool (better than GenericToolRenderer) - MISSING
- ❌ Context (token tracking) - MISSING

---

## 🎯 5 Components to Add

### 1️⃣ SOURCES
```tsx
// ADD THIS IMPORT
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements";

// ADD THIS CASE to message switch
case "source-url":
  const sourceUrls = m.parts.filter(p => p.type === "source-url");
  if (sourceUrls.length > 0) {
    return (
      <Sources key={`${m.id}-sources`} defaultOpen={false}>
        <SourcesTrigger count={sourceUrls.length} />
        <SourcesContent>
          {sourceUrls.map((source, idx) => (
            <Source key={idx} href={source.url} title={source.title}>
              {source.title}
            </Source>
          ))}
        </SourcesContent>
      </Sources>
    );
  }
  break;
```
**Why**: Enables web search and Perplexity integration  
**Time**: 30 minutes  
**Value**: ⭐⭐⭐⭐⭐

---

### 2️⃣ CHAIN OF THOUGHT
```tsx
// ADD THIS IMPORT
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements";

// ADD THIS CASE to message switch
case "chain-of-thought":
  const steps = parseReasoningSteps(part.text);
  return (
    <ChainOfThought
      key={`${m.id}-${i}`}
      defaultOpen={true}
      className="my-4"
    >
      <ChainOfThoughtHeader>Reasoning Process</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {steps.map((step, idx) => (
          <ChainOfThoughtStep
            key={idx}
            label={`Step ${idx + 1}`}
            description={step}
            status={idx === steps.length - 1 ? "active" : "complete"}
          />
        ))}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
  break;

// ADD THIS HELPER FUNCTION
function parseReasoningSteps(text: string): string[] {
  return text.split('\n').filter(line => line.trim());
}
```
**Why**: Better visualization of reasoning steps  
**Time**: 30 minutes  
**Value**: ⭐⭐⭐⭐

---

### 3️⃣ RESPONSE (Advanced Markdown)
```tsx
// ADD THIS IMPORT
import { Response } from "@/components/ai-elements";

// REPLACE THIS:
case "text":
  return (
    <div key={`${m.id}-${i}`} className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {part.text}
      </ReactMarkdown>
    </div>
  );

// WITH THIS:
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
**Why**: Better markdown, math support, streaming improvements  
**Time**: 20 minutes  
**Value**: ⭐⭐⭐⭐

---

### 4️⃣ TOOL (Upgrade)
```tsx
// ADD THIS IMPORT
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements";

// REPLACE the tool rendering section
// FROM (around line 716-731):
if (part.type.startsWith("tool-") && "state" in part) {
  const toolName = part.type.replace("tool-", "");
  return (
    <GenericToolRenderer
      key={`${m.id}-${i}`}
      data={{...}}
    />
  );
}

// TO:
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
**Why**: Better tool visualization  
**Time**: 45 minutes  
**Value**: ⭐⭐⭐

---

### 5️⃣ CONTEXT (Token Tracking)
```tsx
// ADD THIS IMPORT
import {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextContentFooter,
} from "@/components/ai-elements";

// ADD THIS STATE in Chat component
const [tokenUsage, setTokenUsage] = useState({
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  estimatedCost: 0,
});

// ADD THIS EFFECT
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

// ADD THIS to the UI (in the top bar near model selector)
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
```
**Why**: Track token usage and costs  
**Time**: 45 minutes  
**Value**: ⭐⭐⭐

---

## 📋 Summary of Changes

### Files to Modify
- [ ] `components/chat.tsx` - Add all 5 components
- [ ] `components/education-studio.tsx` - Add ChainOfThought + Sources
- [ ] `components/business-chat.tsx` - Add Sources + Context

### Total Imports to Add
```tsx
import {
  Sources, SourcesTrigger, SourcesContent, Source,
  ChainOfThought, ChainOfThoughtHeader, ChainOfThoughtContent, ChainOfThoughtStep,
  Response,
  Tool, ToolHeader, ToolContent, ToolInput, ToolOutput,
  Context, ContextTrigger, ContextContent, ContextContentHeader,
  ContextInputUsage, ContextOutputUsage, ContextContentFooter,
} from "@/components/ai-elements";
```

### Code Changes Summary
- Add 5 new case handlers to message switch
- Add 1 new state (tokenUsage)
- Add 1 new effect (useEffect for token tracking)
- Add 1 helper function (parseReasoningSteps)
- Replace 1 case handler (Response instead of ReactMarkdown)
- Replace 1 section (Tool instead of GenericToolRenderer)
- Add 1 UI element (Context component)

### Estimated Time
- **First 3 (Sources, ChainOfThought, Response)**: ~1.5 hours
- **Second 2 (Tool, Context)**: ~1.5 hours
- **Total**: ~3 hours

---

## 🚀 Quick Start Order

1. Start with **Response** (20 min) - Easiest, most straightforward
2. Add **Sources** (30 min) - High value, straightforward
3. Add **ChainOfThought** (30 min) - Good complement to Sources
4. Add **Tool** (45 min) - More complex, good upgrade
5. Add **Context** (45 min) - Most complex, nice feature

---

## 💡 Pro Tips

1. **Create a branch** before starting: `git checkout -b feat/ai-elements-components`
2. **Test incrementally** - Test after each component
3. **Keep backups** - Save original chat.tsx before modifying
4. **Use TypeScript** - Let your editor help with type hints
5. **Check imports** - Verify all imports exist in ai-elements/index.ts

---

## ✅ Testing After Each Change

```bash
# After Response component
npm run dev  # Test basic markdown rendering

# After Sources
npm run dev  # Test with Perplexity model

# After ChainOfThought
npm run dev  # Test with reasoning model

# After Tool
npm run dev  # Test with tool-using queries

# After Context
npm run dev  # Test token counting
```

---

## 📞 Need Help?

- See `AI_ELEMENTS_IMPLEMENTATION_GUIDE.md` for detailed examples
- See `AI_ELEMENTS_USAGE_AUDIT.md` for full analysis
- Check component files in `components/ai-elements/`
- Reference Vercel AI docs: https://sdk.vercel.ai/docs/ai-elements

---

**Ready to add these components? Start with Response! 🚀**

