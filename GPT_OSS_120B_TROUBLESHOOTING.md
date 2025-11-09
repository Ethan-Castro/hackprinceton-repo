# GPT-OSS-120B Troubleshooting Guide

## Problem: No Preview or Code Rendering

If GPT-OSS-120B generates code but you don't see the preview or rendered output, follow these debugging steps:

## Step 1: Check Browser Console

Open your browser's developer tools (F12) and check the Console tab for logs:

### Expected Logs (Success):
```
[V0 Clone] Sending request to GPT-OSS-120B...
[V0 Clone] Streaming response...
[V0 Clone] Generated code length: 1234
[V0 Clone] First 200 chars: import React from 'react'...
[V0 Clone] Extracted code: 1234 chars
[V0 Clone] Creating CodeSandbox URL...
[V0 Clone] CodeSandbox URL: https://codesandbox.io/api/v1/sandboxes/define?parameters=...
```

### Common Error Patterns:

#### Error 1: No Code Extracted
```
[V0 Clone] Extracted code: null
⚠️ Could not extract code from response.
```

**Cause:** Model didn't wrap code in ```tsx``` block

**Solution:** Try a more specific prompt:
```
Create a React landing page component. 
Respond with ONLY the code wrapped in ```tsx code block.
```

#### Error 2: CodeSandbox URL Error
```
[V0 Clone] CodeSandbox URL Error: Failed to execute 'btoa'...
```

**Cause:** Unicode characters in code (already fixed with our btoa fix)

**Solution:** Should be fixed, but if it persists, check that the Unicode fix is applied in `/lib/extract-code.ts`

#### Error 3: API Error
```
[V0 Clone] API Error: Failed to generate UI
```

**Cause:** Cerebras API key missing or invalid

**Solution:** Check `.env.local` has `CEREBRAS_API_KEY`

## Step 2: Check Terminal Logs

In your terminal where `pnpm dev` is running:

### Expected Logs:
```
[Cerebras UI Gen] Request received
[Cerebras UI Gen] Model: gpt-oss-120b
[Cerebras UI Gen] Message length: 42
[Cerebras UI Gen] Has conversation history: true
[Cerebras UI Gen] Starting generation with gpt-oss-120b
[Cerebras UI Gen] Returning stream response
POST /api/cerebras-ui-gen 200 in 8234ms
```

### Common Issues:

#### Issue 1: Wrong Model
```
[Cerebras UI Gen] Model: qwen-3-235b-a22b-instruct-2507
```

**Problem:** Still using Qwen instead of GPT-OSS-120B

**Fix:** Verify `/app/api/cerebras-ui-gen/route.ts` line 16:
```typescript
const UI_GEN_MODEL = "gpt-oss-120b";
```

#### Issue 2: API Key Error
```
Error: 401 Unauthorized
```

**Problem:** Missing or invalid `CEREBRAS_API_KEY`

**Fix:**
1. Check `.env.local` exists
2. Verify key format: `CEREBRAS_API_KEY=your_key_here`
3. Get key from https://cloud.cerebras.ai
4. Restart dev server after adding key

#### Issue 3: Model Not Found
```
Error: Model 'gpt-oss-120b' not found
```

**Problem:** Model ID typo or Cerebras API doesn't recognize it

**Fix:** Try alternative model IDs:
- `gpt-oss-120b` (preferred)
- `cerebras/gpt-oss-120b` (with provider prefix)

## Step 3: Test the API Directly

Test the Cerebras endpoint directly:

```bash
curl -X POST http://localhost:3000/api/cerebras-ui-gen \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a simple React button component"
  }'
```

### Expected Response:
Should stream back code wrapped in ```tsx``` block:

```typescript
import React from 'react';

export default function Button() {
  return <button className="...">Click me</button>;
}
```

### If Nothing Returns:
1. Check CEREBRAS_API_KEY is set
2. Check Cerebras API status: https://status.cerebras.ai
3. Try a simpler prompt
4. Check for rate limits

## Step 4: Verify Code Extraction

Test the code extraction function:

```typescript
// In browser console or Node.js
import { extractReactCode } from '@/lib/extract-code';

const response = `
Here's your component:

\`\`\`tsx
import React from 'react';
export default function Test() {
  return <div>Test</div>;
}
\`\`\`
`;

const code = extractReactCode(response);
console.log("Extracted:", code);
```

**Expected:** Should return the code without the ```tsx wrapper

**If null:** The extraction regex isn't matching. Check the response format.

## Step 5: Check Model Prompt

The model should be instructed to return ONLY code. Verify in `/app/api/cerebras-ui-gen/route.ts`:

```typescript
const V0_STYLE_SYSTEM_PROMPT = `...
IMPORTANT: No explanations, no text before or after the code block. Just output:
\`\`\`tsx
[complete component code here]
\`\`\`

Start your response with \`\`\`tsx and end with \`\`\` - nothing else.`;
```

## Step 6: Test with Simple Prompt

Try the simplest possible prompt to isolate issues:

**Prompt:**
```
Create a div with "Hello World"
```

**Expected Output:**
```tsx
import React from 'react';

export default function HelloWorld() {
  return <div>Hello World</div>;
}
```

**If this works:** Your setup is correct, try more complex prompts

**If this fails:** Check Steps 1-5 again

## Step 7: Common Model-Specific Issues

### GPT-OSS-120B Behavior

**Known characteristics:**
- Sometimes adds explanation before code
- May not always follow ```tsx format strictly
- Can be verbose in responses

**Workarounds:**

1. **More specific prompts:**
```
Create a React button. 
Respond with code only, wrapped in ```tsx
No explanations.
```

2. **Update extraction regex** (if needed):
```typescript
// In /lib/extract-code.ts
// Make regex more flexible
const codeBlockMatch = content.match(/```(?:tsx|typescript|jsx|javascript)?\s*\n([\s\S]*?)```/);
```

3. **Fallback to simpler models** for testing:
```typescript
// Temporarily switch to Llama for testing
const UI_GEN_MODEL = "llama-3.3-70b";
```

## Step 8: Check Preview Iframe

If code extracts but preview doesn't show:

### Check CodeSandbox URL
```javascript
// In browser console
console.log(previewUrl);
```

Should look like:
```
https://codesandbox.io/api/v1/sandboxes/define?parameters=eyJmaWxlcyI6...
```

### Test URL Directly
Copy the URL and paste in browser. Should open CodeSandbox editor.

### If Iframe Stays Blank:
1. **Check CORS:** CodeSandbox might block iframe embedding
2. **Try StackBlitz** as alternative:
```typescript
import { createStackBlitzUrl } from '@/lib/extract-code';
const url = createStackBlitzUrl(code, 'Test');
```

3. **Check Content Security Policy:** Your app might block iframe embeds

## Step 9: Environment Checklist

Verify your environment:

```bash
# Check Node version (need 18+)
node --version

# Check package versions
cat package.json | grep cerebras
# Should show: "@ai-sdk/cerebras": "^1.0.29"

# Check env file exists
ls -la .env.local

# Check key is set
grep CEREBRAS_API_KEY .env.local
```

## Step 10: Complete Reset

If nothing works, try a complete reset:

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear Next.js cache
rm -rf .next

# 3. Reinstall dependencies
pnpm install

# 4. Verify environment variables
cat .env.local

# 5. Restart dev server
pnpm dev

# 6. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)

# 7. Try again
```

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| No preview | Check browser console for `[V0 Clone]` logs |
| Wrong model | Verify `UI_GEN_MODEL = "gpt-oss-120b"` |
| API error | Check `CEREBRAS_API_KEY` in `.env.local` |
| No code extracted | Try simpler, more specific prompt |
| Iframe blank | Copy URL, test in new tab |
| 401 error | Regenerate Cerebras API key |
| Timeout | Try shorter prompt |
| Unicode error | Already fixed in `extract-code.ts` |

## Still Not Working?

### Debug Mode

Add this to your component for detailed logging:

```typescript
// In V0CloneChat.tsx, add to state:
const [debugInfo, setDebugInfo] = useState<any>({});

// After code extraction:
setDebugInfo({
  rawLength: generatedCode.length,
  extractedLength: extractedCode?.length,
  hasCode: !!extractedCode,
  firstChars: generatedCode.substring(0, 100),
});

// Display in UI:
{debugInfo.hasCode !== undefined && (
  <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
)}
```

### Share Logs

When asking for help, include:
1. Browser console logs (full `[V0 Clone]` section)
2. Terminal logs (full `[Cerebras UI Gen]` section)
3. The prompt you used
4. Your Node.js version
5. Package versions (`@ai-sdk/cerebras`, `ai`)

### Alternative: Use v0 SDK

If GPT-OSS-120B isn't working, you can temporarily fall back to the official v0 SDK:

```bash
# Add to .env.local
V0_API_KEY=your_v0_key_here
```

Then switch the endpoint:
```typescript
// In V0CloneChat.tsx
const response = await fetch("/api/v0-chat", { // Use v0 SDK
  method: "POST",
  body: JSON.stringify({ message: input, chatId }),
});
```

This uses the paid v0 API but guarantees working previews.

## Success Criteria

You'll know it's working when:
- ✅ Browser shows `[V0 Clone] CodeSandbox URL: https://...`
- ✅ Preview iframe loads and shows your component
- ✅ Can view code by expanding details section
- ✅ Can continue conversation with followups
- ✅ New prompts generate new previews

## Model Comparison

If GPT-OSS-120B isn't working well, try these alternatives:

```typescript
// In /app/api/cerebras-ui-gen/route.ts

// Option 1: Llama 3.3 70B (good quality)
const UI_GEN_MODEL = "llama-3.3-70b";

// Option 2: Llama 3.1 8B (faster, simpler)
const UI_GEN_MODEL = "llama3.1-8b";

// Option 3: Qwen (multilingual)
const UI_GEN_MODEL = "qwen-3-32b";
```

All support tools and are free via Cerebras.

---

**Need more help?**
- Check: `GPT_OSS_120B_MIGRATION.md` - Full documentation
- Check: `FIXES_CEREBRAS_V0_BTOA.md` - Unicode fix details
- Check: `CEREBRAS_TOOLS_ENABLED.md` - Tools configuration

**Last updated:** November 9, 2025

