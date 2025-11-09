# ⚡ GPT-OSS-120B Quick Start

All v0 clones now use **Cerebras GPT-OSS-120B** (free & fast!)

## What Changed

✅ **V0 Clone** (`/v0-clone`) - Updated to use GPT-OSS-120B  
✅ **Business Studio** (`/business/studio`) - Already using Cerebras  
✅ **Education Studio** (`/education/studio`) - Already using Cerebras  
✅ **Health Studio** (`/health/studio`) - Already using Cerebras  
✅ **Sustainability Studio** (`/sustainability/studio`) - Already using Cerebras  

**All now powered by GPT-OSS-120B** (120 billion parameters)

## Setup

1. **Add Cerebras API key:**
   ```bash
   # .env.local
   CEREBRAS_API_KEY=your_key_here
   ```
   
   Get free key: https://cloud.cerebras.ai

2. **Restart dev server:**
   ```bash
   pnpm dev
   ```

3. **Test it:**
   - Visit http://localhost:3000/v0-clone
   - Try: "Create a modern landing page"
   - Preview loads in ~10 seconds ⚡

## Benefits

| Feature | Before (v0 SDK) | After (GPT-OSS-120B) |
|---------|-----------------|----------------------|
| **Cost** | $0.10-0.50/gen | **$0.00 (FREE)** ✅ |
| **Speed** | 10-30s | **5-15s** ⚡ |
| **Quality** | Excellent | Excellent ✅ |
| **Tools** | ❌ Disabled | **✅ Enabled** |
| **API Key** | Paid | Free ✅ |

## Files Modified

1. **`/app/api/cerebras-ui-gen/route.ts`**
   - Changed from Qwen → **GPT-OSS-120B**

2. **`/components/v0-clone/V0CloneChat.tsx`**
   - Changed from v0 SDK → **Cerebras API**
   - Added code extraction
   - Added CodeSandbox preview

3. **`/components/v0-studio/BaseV0Chat.tsx`**
   - Updated comment to reflect GPT-OSS-120B

## How It Works

```
User types prompt
  ↓
GPT-OSS-120B generates React code
  ↓
Extract code from response
  ↓
Create CodeSandbox preview URL
  ↓
Display in iframe
```

## Test Prompts

Try these to see GPT-OSS-120B in action:

**Landing Page:**
```
Create a modern SaaS landing page with hero, features, and pricing
```

**Dashboard:**
```
Build a revenue dashboard with charts and metrics cards
```

**E-commerce:**
```
Design a product page with image gallery and add to cart
```

## Troubleshooting

**No preview?**
- Check `CEREBRAS_API_KEY` in `.env.local`
- Restart dev server
- Check browser console for errors

**Code not extracting?**
- Regenerate with clearer prompt
- Check terminal logs

**Model timeout?**
- Simplify prompt
- Check Cerebras API status

## Documentation

Full details: `GPT_OSS_120B_MIGRATION.md`

---

**Status:** ✅ Ready to use  
**Model:** GPT-OSS-120B (120B params)  
**Cost:** $0.00 per generation  
**Speed:** 5-15 seconds

