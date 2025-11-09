A simple [Next.js](https://nextjs.org) chatbot app to demonstrate the use of the Vercel AI Gateway with the [AI SDK](https://sdk.vercel.ai).

## 🚀 Live Demo

**Production URL**: [https://vercel.com/ethan-6436s-projects/augment-hack](https://vercel.com/ethan-6436s-projects/augment-hack)

## Supported Providers

This demo supports multiple AI providers including:
- Amazon (Nova models)
- Anthropic (Claude)
- Cerebras (Llama, GPT-OSS, Qwen models) - [Setup Guide](./CEREBRAS_SETUP.md)
- Google (Gemini, Gemma)
- Meta (Llama)
- Mistral
- OpenAI (GPT models)
- xAI (Grok)

## 🎙️ Voice Features (NEW!)

**ElevenLabs TTS & STT Integration**
- **Voice Input**: Click the microphone icon to speak your questions
- **Text-to-Speech**: Hover over AI responses and click the speaker icon to hear them read aloud
- [Quick Start Guide](./ELEVENLABS_QUICK_START.md) | [Full Documentation](./ELEVENLABS_INTEGRATION.md)

## AI Elements Components

This project includes AI Elements UI components for enhanced chat experiences:
- **Shimmer** - Animated loading states for streaming content
- **Plan** - Collapsible execution plans with streaming support
- **Task** - Task lists with progress indicators

See [AI_ELEMENTS.md](./AI_ELEMENTS.md) for detailed documentation and usage examples.

## Getting Started

### One-time setup

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-gateway-demo)

1. Clone this repository with the Deploy button above
1. Install the [Vercel CLI](https://vercel.com/docs/cli) if you don't already have it
1. Clone the repository you created above: `git clone <repo-url>`
1. Link it to a Vercel project: `vc link` or `vc deploy`

### Usage
1. Install packages with `pnpm i` (or `npm i` or `yarn i`) and run the development server with `vc dev`
1. Open http://localhost:3000 to try the chatbot

## Health Coach (Generative UI + Neo4j)

A health-focused experience is available at `/health` with:
- Advice chat, report understanding, deep research, fitness ebook planning, and personal trackers.

### Setup
1. Configure environment variables (see `env.example`):
   - `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`
2. Install dependencies:
   - `neo4j-driver` (database)
   - `pdf-parse` (PDF extraction)
   - `tesseract.js` (image OCR)
3. Start the app and visit `/health`.

### FAQ

1. If you prefer running your local development server directly rather than using `vc dev`, you'll need to run `vc env pull` to fetch the project's OIDC authentication token locally
   1. the token expires every 12h, so you'll need to re-run this command periodically.
   1. if you use `vc dev` it will auto-refresh the token for you, so you don't need to fetch it manually
1. If you're linking to an existing, older project, you may need to enable the OIDC token feature in your project settings.
   1. visit the project settings page (rightmost tab in your project's dashboard)
   1. search for 'OIDC' in settings
   1. toggle the button under "Secure Backend Access with OIDC Federation" to Enabled and click the "Save" button

## Authors

This repository is maintained by the [Vercel](https://vercel.com) team and community contributors. 

Contributions are welcome! Feel free to open issues or submit pull requests to enhance functionality or fix bugs.
