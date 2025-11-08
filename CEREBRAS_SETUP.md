# Cerebras Setup (via AI Gateway)

This guide explains how Cerebras models are used in this project via the Vercel AI Gateway. You can still use the direct `@ai-sdk/cerebras` provider for custom cases, but by default all requests are routed through the Gateway.

## Overview

The Cerebras provider offers access to powerful language models with high-speed inference capabilities powered by Wafer-Scale Engines and CS-3 systems.

**Setup Type:** Routed through Vercel AI Gateway (default)

## Available Models

The following Cerebras models are available in this project (gateway IDs):

- `cerebras/llama3.1-8b` - Llama 3.1 8B model
- `cerebras/llama-3.3-70b` - Llama 3.3 70B model
- `cerebras/gpt-oss-120b` - GPT OSS 120B model
- `cerebras/qwen-3-235b-a22b-instruct-2507` - Qwen 3 235B Instruct
- `cerebras/qwen-3-235b-a22b-thinking-2507` - Qwen 3 235B Thinking
- `cerebras/qwen-3-32b` - Qwen 3 32B
- `cerebras/qwen-3-coder-480b` - Qwen 3 Coder 480B

## Configuration Steps

### 1. Configure AI Gateway ✅

Add the Gateway API key to `.env.local`:

```
AI_GATEWAY_API_KEY=your_gateway_api_key_here
# Optional (defaults to https://api.ai.vercel.com/v1):
# AI_GATEWAY_BASE_URL=https://api.ai.vercel.com/v1
```

### 2. Package Already Installed ✅

The `@ai-sdk/cerebras` package is installed (optional). Default routing uses `@ai-sdk/gateway`.

### 3. Start Using Cerebras Models

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

4. Start chatting to verify the integration works

## Model Capabilities

All Cerebras models support:

- ✅ Object Generation
- ✅ Tool Usage
- ✅ Tool Streaming
- ❌ Image Input (not supported)

## Notes

- Context windows are temporarily limited to 8,192 tokens in the Free Tier
- For production use, consider upgrading to a paid tier for longer context windows
- See [Cerebras documentation](https://inference-docs.cerebras.ai/introduction) for more details

## How It Works

This project routes all models (including Cerebras) through the **Vercel AI Gateway** by default.
The chat routes use `@ai-sdk/gateway`, and model IDs are in the form `provider/model-id` (e.g., `cerebras/llama3.1-8b`).

## Troubleshooting

If you encounter issues:

1. **API Key Error:** Verify `AI_GATEWAY_API_KEY` is set in `.env.local`
2. **Model Not Found:** Ensure the model ID matches exactly (e.g., `cerebras/llama3.1-8b`)
3. **Connection Issues:** Check your internet connection and Cerebras API status
4. **Server Not Updating:** Restart the dev server after environment variable changes

