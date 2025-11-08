# Setup Instructions for Cerebras Models

## Important: Credentials

1. **Cerebras API Key** – Required for all Cerebras models (set `CEREBRAS_API_KEY`)
2. **Vercel AI Gateway API Key** – Required if you plan to use Anthropic, Google, or other non-Cerebras models through the Gateway

## Step 1: Configure Environment Variables

Create or update `.env.local` with the required keys:

```bash
CEREBRAS_API_KEY=your_cerebras_api_key_here
# Required if you want to call non-Cerebras models through the Gateway
AI_GATEWAY_API_KEY=your_gateway_api_key_here
# Optional (defaults to https://ai-gateway.vercel.sh/v1/ai)
# AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1/ai
```

Restart the dev server after updating the environment file.

## Step 2: Link Project to Vercel (Recommended)

Run this command to link your project:

```bash
vc link
```

This will:
- Connect your local project to a Vercel project
- Enable OIDC authentication (automatic token refresh)
- Allow you to configure providers in the dashboard

## Step 3 (Optional): Configure Cerebras in Vercel Dashboard

If you want observability or shared credential management through Vercel, you can still register Cerebras as a provider in the AI Gateway dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **AI Gateway**
4. Click **Add Provider** or **Configure Providers**
5. Select **Cerebras**
6. Enter your Cerebras API key securely (do not commit to Git)
7. Save the configuration

> Note: The application now calls the Cerebras API directly using `CEREBRAS_API_KEY`. Dashboard configuration is optional.

## Step 4: Run the Development Server

### Option A: Using Vercel CLI (Recommended - Auto OIDC)

```bash
vc dev
```

This automatically handles OIDC token authentication. Ensure `CEREBRAS_API_KEY` is available in your environment (for example by using `.env.local`).

### Option B: Using Next.js Dev Server (Gateway API Key)

1. Create `.env.local` and add:
   ```bash
   CEREBRAS_API_KEY=your_cerebras_api_key_here
   AI_GATEWAY_API_KEY=your_gateway_api_key_here
   # Optional (defaults to https://ai-gateway.vercel.sh/v1/ai)
   # AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1/ai
   ```

2. Start the dev server:
   ```bash
   pnpm dev
   ```

   Note: If you use OIDC with `vc dev`, tokens expire periodically.

### Option C: Using Gateway API Key (Alternative)

If you have a Vercel AI Gateway API key:

1. Create `.env.local` file:
   ```bash
   CEREBRAS_API_KEY=your_cerebras_api_key_here
   AI_GATEWAY_API_KEY=your_gateway_api_key_here
   ```

2. Start the dev server:
   ```bash
   pnpm dev
   ```

## Step 5: Verify Setup

1. Open http://localhost:3000
2. Select a Cerebras model from the dropdown
3. Start chatting to verify it works

## Troubleshooting

### Error: "AI Gateway authentication failed"

**Solution 1:** Link project to Vercel and use `vc dev`:
```bash
vc link
vc dev
```

**Solution 2:** Use Gateway API key and set it:
```bash
# .env.local
CEREBRAS_API_KEY=csk-c3kxh2crphtj9fmcd3xpk569nndvn88yw6tkh4n6kdd6v99d
AI_GATEWAY_API_KEY=vck_0YZ4R0cf4335wbstIGGGWGZcuq5fqP4xrdB0EeOj5dExLnZn0b3uP1i8
# AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1/ai
```

**Solution 3:** Pull OIDC token:
```bash
vc env pull .env.local
pnpm dev
```

### Error: "Cerebras authentication failed"

- Ensure `CEREBRAS_API_KEY` is set in `.env.local`
- Restart the dev server so the new environment variable is picked up
- Confirm the key is valid by testing it with a simple SDK or `curl` request

### Error: "Model not found" or Cerebras models not appearing

- Verify `CEREBRAS_API_KEY` is present and loaded (restart the dev server after setting it)
- Ensure the model IDs match exactly (e.g., `cerebras/llama3.1-8b`)
- Confirm you are on the latest branch with the updated Cerebras integration

### Project not linked to Vercel

Run `vc link` and follow the prompts to connect your project.

