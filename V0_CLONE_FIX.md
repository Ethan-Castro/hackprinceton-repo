# V0 Clone Preview Fix

## Problem

The V0 Clone component was:
1. **Calling wrong API endpoints** - Using `/api/textbook-studio/chats` instead of v0 endpoints
2. **Not rendering previews** - Code was showing but no live preview appeared
3. **No demo links** - The iframe preview panel stayed empty

## Root Cause

The `V0CloneChat` component (lines 64-68) was incorrectly calling the textbook studio API:

```typescript
// WRONG - Old code
endpoint = "/api/textbook-studio/chats";
```

This endpoint doesn't provide the `demo` URL needed for the iframe preview.

## Solution

Fixed the component to use the correct v0 SDK endpoint:

```typescript
// CORRECT - New code
const response = await fetch("/api/v0-chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: input,
    chatId: chatId,
  }),
});
```

## How It Works Now

### 1. User Flow
```
User types prompt → /api/v0-chat → v0 SDK API → Returns chat with demo URL → Iframe shows preview
```

### 2. API Response Structure
```json
{
  "id": "chat_abc123",
  "demo": "https://v0.dev/chat/abc123"
}
```

### 3. Preview Rendering
The `demo` URL is displayed in an iframe in the right panel:

```tsx
{previewUrl && (
  <iframe
    src={previewUrl}
    className="absolute inset-0 h-full w-full border-0"
    title="Preview"
  />
)}
```

## Two Approaches for V0-Style UI Generation

### Option 1: Real v0 SDK (Current Implementation) ✅

**Endpoint:** `/api/v0-chat`

**Pros:**
- ✅ Official v0 API with professional results
- ✅ Returns hosted demo URL (ready to embed)
- ✅ Multi-file projects with full Next.js setup
- ✅ Access to v0's design system
- ✅ Version history and iterations
- ✅ Can deploy to Vercel directly

**Cons:**
- ❌ Requires v0 API key (get from [v0.dev/chat/settings/keys](https://v0.dev/chat/settings/keys))
- ❌ Costs credits per generation
- ❌ Rate limits apply

**Setup:**
```bash
# Add to .env.local
V0_API_KEY=your_v0_api_key_here
```

**Response:**
```json
{
  "id": "chat_123",
  "demo": "https://v0.dev/chat/123",
  "files": [...],
  "messages": [...]
}
```

---

### Option 2: Cerebras UI Gen (Alternative)

**Endpoint:** `/api/cerebras-ui-gen`

**Pros:**
- ✅ Free (using Cerebras API)
- ✅ Fast inference
- ✅ No rate limits
- ✅ Custom system prompts
- ✅ You control the output format

**Cons:**
- ❌ Returns raw code (not a hosted URL)
- ❌ Needs code extraction logic
- ❌ Must generate preview yourself (CodeSandbox/StackBlitz)
- ❌ No built-in version history

**How to Use Cerebras Approach:**

If you want to use Cerebras instead, you need to:

1. **Extract the code from streaming response:**
```typescript
const response = await fetch("/api/cerebras-ui-gen", {
  method: "POST",
  body: JSON.stringify({ message: input }),
});

let code = "";
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader!.read();
  if (done) break;
  code += decoder.decode(value);
}
```

2. **Parse the code block:**
```typescript
import { extractReactCode } from "@/lib/extract-code";

const extractedCode = extractReactCode(code);
if (extractedCode) {
  // Got the component code
}
```

3. **Create a preview URL:**
```typescript
import { createCodeSandboxUrl } from "@/lib/extract-code";

const sandboxUrl = createCodeSandboxUrl(extractedCode, "My Component");
setPreviewUrl(sandboxUrl);
```

**See the BaseV0Chat component** for a complete example of this approach:
- `/components/v0-studio/BaseV0Chat.tsx` (lines 290-400)

---

## Configuration

### Required Environment Variables

```bash
# For v0 SDK approach (current)
V0_API_KEY=your_v0_api_key_here

# For Cerebras approach (alternative)
CEREBRAS_API_KEY=your_cerebras_api_key_here
```

### Get API Keys

1. **v0 API Key:** https://v0.dev/chat/settings/keys
2. **Cerebras API Key:** https://cloud.cerebras.ai

## Testing

### Test the Fixed v0 Clone

1. Start your dev server:
   ```bash
   pnpm dev
   ```

2. Visit: http://localhost:3000/v0-clone

3. Try a prompt:
   ```
   Create a landing page with a hero section, features, and pricing
   ```

4. **Expected behavior:**
   - ✅ Message appears in chat
   - ✅ Loading indicator shows
   - ✅ Preview iframe loads with generated UI
   - ✅ Can send follow-up messages

### If Preview Doesn't Load

**Check:**
1. ✅ V0_API_KEY is set in `.env.local`
2. ✅ Terminal shows successful API call (no 401/403 errors)
3. ✅ Browser console shows no errors
4. ✅ Response includes `demo` field

**Debug:**
```bash
# Check server logs
# You should see:
POST /api/v0-chat 200 in XXXXms

# If you see 500 error:
# - Check V0_API_KEY is valid
# - Check v0 API status: https://status.vercel.com
```

## Comparison Table

| Feature | v0 SDK | Cerebras UI Gen |
|---------|--------|-----------------|
| **Cost** | Paid (credits) | Free |
| **Speed** | ~10-30s | ~5-15s |
| **Preview** | Hosted URL | Must generate |
| **Quality** | Professional | Good |
| **Multi-file** | ✅ Yes | ⚠️ Single file |
| **Iterations** | ✅ Built-in | ❌ Manual |
| **Deployment** | ✅ One-click | ❌ Manual |
| **Setup** | V0 API key | Cerebras key |

## Recommendation

- **For production/demos:** Use **v0 SDK** (current implementation)
  - Better UX with instant hosted previews
  - Professional results
  - Built-in iteration support

- **For development/testing:** Use **Cerebras** 
  - No cost
  - Fast iteration
  - Good for prototyping

## Files Modified

- ✅ `/components/v0-clone/V0CloneChat.tsx` - Fixed API endpoints
- ✅ `/app/api/v0-chat/route.ts` - Already correct
- ✅ `/app/api/cerebras-ui-gen/route.ts` - Already available as alternative

## Related Documentation

- See `V0_STUDIO_README.md` for v0 studio components
- See `CEREBRAS_TOOLS_ENABLED.md` for Cerebras configuration
- See `FIXES_CEREBRAS_V0_BTOA.md` for Unicode encoding fix

---

**Status:** ✅ **FIXED**  
**Fixed:** November 9, 2025  
**Component:** `/components/v0-clone/V0CloneChat.tsx`

