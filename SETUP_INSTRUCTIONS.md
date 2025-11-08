# Setup Instructions for Cerebras Integration

## Important: Two Different API Keys

1. **Cerebras API Key** (`csk-c3kxh2crphtj9fmcd3xpk569nndvn88yw6tkh4n6kdd6v99d`) - For the Cerebras provider
2. **Vercel AI Gateway API Key** - For authenticating with the Gateway itself

## Step 1: Link Project to Vercel (Recommended)

Run this command to link your project:

```bash
vc link
```

This will:
- Connect your local project to a Vercel project
- Enable OIDC authentication (automatic token refresh)
- Allow you to configure providers in the dashboard

## Step 2: Configure Cerebras in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **AI Gateway**
4. Click **Add Provider** or **Configure Providers**
5. Select **Cerebras**
6. Enter your Cerebras API key: `csk-c3kxh2crphtj9fmcd3xpk569nndvn88yw6tkh4n6kdd6v99d`
7. Save the configuration

## Step 3: Run the Development Server

### Option A: Using Vercel CLI (Recommended - Auto OIDC)

```bash
vc dev
```

This automatically handles OIDC token authentication.

### Option B: Using Next.js Dev Server (Requires Manual Setup)

1. Pull environment variables:
   ```bash
   vc env pull .env.local
   ```

2. Start the dev server:
   ```bash
   pnpm dev
   ```

   Note: OIDC tokens expire every 12 hours, so you'll need to re-run `vc env pull` periodically.

### Option C: Using Gateway API Key (Alternative)

If you have a Vercel AI Gateway API key:

1. Create `.env.local` file:
   ```bash
   AI_GATEWAY_API_KEY=your_gateway_api_key_here
   ```

2. Start the dev server:
   ```bash
   pnpm dev
   ```

## Step 4: Verify Setup

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

**Solution 2:** Get Gateway API key and set it:
```bash
# Create .env.local with:
AI_GATEWAY_API_KEY=your_gateway_api_key
```

**Solution 3:** Pull OIDC token:
```bash
vc env pull .env.local
pnpm dev
```

### Error: "Model not found" or Cerebras models not appearing

- Verify Cerebras is configured in Vercel Dashboard → Settings → AI Gateway
- Check that the Cerebras API key is correctly entered
- Ensure the model IDs match exactly (e.g., `cerebras/llama3.1-8b`)

### Project not linked to Vercel

Run `vc link` and follow the prompts to connect your project.

