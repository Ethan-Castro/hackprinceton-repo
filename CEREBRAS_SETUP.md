# Cerebras Provider Setup (Direct AI SDK)

This guide explains how to use Cerebras models directly through the `@ai-sdk/cerebras` package.

## Overview

The Cerebras provider offers access to powerful language models with high-speed inference capabilities powered by Wafer-Scale Engines and CS-3 systems.

**Setup Type:** Direct connection using `@ai-sdk/cerebras` (not through Vercel AI Gateway)

## Available Models

The following Cerebras models are available in this project:

- `llama3.1-8b` - Llama 3.1 8B model
- `llama-3.3-70b` - Llama 3.3 70B model
- `gpt-oss-120b` - GPT OSS 120B model
- `qwen-3-235b-a22b-instruct-2507` - Qwen 3 235B Instruct
- `qwen-3-235b-a22b-thinking-2507` - Qwen 3 235B Thinking
- `qwen-3-32b` - Qwen 3 32B
- `qwen-3-coder-480b` - Qwen 3 Coder 480B

## Configuration Steps

### 1. API Key Already Configured ✅

Your Cerebras API key has been added to `.env.local`:
```
CEREBRAS_API_KEY=csk-c3kxh2crphtj9fmcd3xpk569nndvn88yw6tkh4n6kdd6v99d
```

### 2. Package Already Installed ✅

The `@ai-sdk/cerebras` package is already installed and configured.

### 3. Start Using Cerebras Models

1. Restart your development server (if running):
   ```bash
   # Stop existing server with Ctrl+C, then:
   pnpm dev
   ```

2. Open http://localhost:3000

3. Select a Cerebras model from the model selector:
   - **llama3.1-8b** - Fast, efficient 8B model
   - **llama-3.3-70b** - Powerful 70B model
   - **qwen-3-coder-480b** - Specialized for coding
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

This project uses **dual provider architecture**:

- **Cerebras models** → Direct connection via `@ai-sdk/cerebras`
- **Other models** (OpenAI, Anthropic, etc.) → Routed through Vercel AI Gateway

The chat route (`app/api/chat/route.ts`) automatically selects the correct provider based on the model ID.

## Troubleshooting

If you encounter issues:

1. **API Key Error:** Verify `CEREBRAS_API_KEY` is set in `.env.local`
2. **Model Not Found:** Ensure the model ID matches exactly (e.g., `llama3.1-8b` not `cerebras/llama3.1-8b`)
3. **Connection Issues:** Check your internet connection and Cerebras API status
4. **Server Not Updating:** Restart the dev server after environment variable changes

