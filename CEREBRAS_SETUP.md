# Cerebras Setup (Direct Provider)

This guide explains how Cerebras models are used in this project. Cerebras requests run through the direct `@ai-sdk/cerebras` provider, while non-Cerebras models continue to use the Vercel AI Gateway.

## Overview

The Cerebras provider offers access to powerful language models with high-speed inference capabilities powered by Wafer-Scale Engines and CS-3 systems.

**Setup Type:** Direct `@ai-sdk/cerebras` provider (Cerebras models) + AI Gateway (other providers)

## Available Models

The following Cerebras models are available in this project (UI IDs):

- `cerebras/llama3.1-8b` - Llama 3.1 8B model
- `cerebras/llama-3.3-70b` - Llama 3.3 70B model
- `cerebras/gpt-oss-120b` - GPT OSS 120B model
- `cerebras/qwen-3-235b-a22b-instruct-2507` - Qwen 3 235B Instruct
- `cerebras/qwen-3-235b-a22b-thinking-2507` - Qwen 3 235B Thinking
- `cerebras/qwen-3-32b` - Qwen 3 32B
- `cerebras/qwen-3-coder-480b` - Qwen 3 Coder 480B

## Configuration Steps

### 1. Configure Cerebras API Key ✅

Add your Cerebras API key to `.env.local`:

```
CEREBRAS_API_KEY=your_cerebras_api_key_here
```

### 2. Configure AI Gateway (for other providers) ✅

Add the Gateway API key to `.env.local` if you want to use Anthropic, Google, or other providers:

```
AI_GATEWAY_API_KEY=your_gateway_api_key_here
# Optional (defaults to https://ai-gateway.vercel.sh/v1/ai):
# AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1/ai
```

### 3. Package Already Installed ✅

The `@ai-sdk/cerebras` package is installed and used automatically for Cerebras models.

### 4. Start Using Cerebras Models

1. Restart your development server (if running):
   ```bash
   # Stop existing server with Ctrl+C, then:
   pnpm dev
   ```

2. Open http://localhost:3000

3. Select a Cerebras model from the model selector:
   - **cerebras/llama3.1-8b** - Fast, efficient 8B model
   - **cerebras/llama-3.3-70b** - Powerful 70B model
   - **cerebras/qwen-3-coder-480b** - Specialized for coding
   - And 4 more models...

4. Start chatting to verify the integration works. Cerebras traffic will go directly to the Cerebras API.

## Model Capabilities

All Cerebras models support:

- ✅ Object generation
- ✅ Reasoning (for thinking models)
- ✅ Markdown-formatted responses
- ❌ Tool usage (disabled due to Cerebras API limitations with tool payloads)
- ❌ Image input

## Notes

- Context windows are temporarily limited to 8,192 tokens in the Free Tier
- For production use, consider upgrading to a paid tier for longer context windows
- See [Cerebras documentation](https://inference-docs.cerebras.ai/introduction) for more details

## How It Works

When a UI model id starts with `cerebras/`, the API strips the prefix and instantiates the model via:

```ts
import { cerebras } from "@ai-sdk/cerebras";

const model = cerebras("llama3.1-8b");
```

Non-Cerebras models continue to be routed through the Vercel AI Gateway using `provider/model-id` strings (e.g., `anthropic/claude-sonnet-4.5`).

## Troubleshooting

If you encounter issues:

1. **Missing Cerebras key:** Ensure `CEREBRAS_API_KEY` is set in `.env.local`
2. **Model Not Found:** Ensure the model ID matches exactly (e.g., `cerebras/llama3.1-8b`)
3. **Connection Issues:** Check your internet connection and [Cerebras API status](https://status.cerebras.ai/)
4. **Server Not Updating:** Restart the dev server after environment variable changes

