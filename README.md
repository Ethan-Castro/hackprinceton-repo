# Vercel AI Gateway Demo

A comprehensive Next.js application demonstrating the power of the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) with the [Vercel AI SDK](https://sdk.vercel.ai). This project showcases multi-provider AI integration, domain-specific studios, voice capabilities, and advanced tooling.

## 🚀 Live Demo

**Production URL**: [https://vercel.com/ethan-6436s-projects/augment-hack](https://vercel.com/ethan-6436s-projects/augment-hack)

## ✨ Features

### Core Capabilities

- **Multi-Provider AI Support** - Seamlessly switch between multiple AI providers
- **Voice Integration** - Text-to-speech and speech-to-text with ElevenLabs
- **AI Elements Components** - Rich UI components for enhanced chat experiences
- **Domain-Specific Studios** - Specialized AI interfaces for different use cases
- **Tool Integration** - MCP, code execution, web scraping, and more
- **Authentication** - NextAuth integration with multiple auth strategies
- **Database Integration** - PostgreSQL (Neon) and Neo4j support

### Available Studios & Features

| Feature | Route | Description |
|---------|-------|-------------|
| **Main Chat** | `/` | General-purpose AI chatbot |
| **Education Studio** | `/education/studio` | Generate quizzes, lessons, and learning apps |
| **Health Coach** | `/health` | Health advice, report analysis, fitness planning |
| **Business Studio** | `/business/studio` | Analytics dashboards, CRM tools, business reports |
| **Sustainability Studio** | `/sustainability/studio` | Carbon tracking, ESG reports, impact analysis |
| **Business Analyst** | `/business-analyst` | Data analysis with Python code execution |
| **v0 Clone** | `/v0-clone` | Generic UI generation interface |
| **Textbook Studio** | `/textbook-studio` | Educational content creation platform |
| **Playground** | `/playground` | Experimental features and testing |

## 🎯 Supported AI Providers

This demo supports multiple AI providers through the Vercel AI Gateway:

- **Amazon** - Nova models
- **Anthropic** - Claude models
- **Cerebras** - Llama, GPT-OSS, Qwen models ([Setup Guide](./CEREBRAS_SETUP.md))
- **Google** - Gemini, Gemma models
- **Meta** - Llama models
- **Mistral** - Mistral models
- **OpenAI** - GPT models
- **xAI** - Grok models

## 🎙️ Voice Features

**ElevenLabs Integration**
- **Voice Input**: Click the microphone icon to speak your questions
- **Text-to-Speech**: Hover over AI responses and click the speaker icon to hear them read aloud
- [Quick Start Guide](./ELEVENLABS_QUICK_START.md) | [Full Documentation](./ELEVENLABS_INTEGRATION.md)

## 🧩 AI Elements Components

Enhanced UI components for better chat experiences:

- **Shimmer** - Animated loading states for streaming content
- **Plan** - Collapsible execution plans with streaming support
- **Task** - Task lists with progress indicators
- **Artifact** - Display code, documents, and structured content
- **WebPreview** - Live web page previews with navigation

See [AI_ELEMENTS.md](./AI_ELEMENTS.md) for detailed documentation and usage examples.

## 🛠️ Tools & Integrations

### Available Tools

- **Code Execution** - Python code execution via E2B (NumPy, Pandas, Matplotlib)
- **Web Search** - Exa Search API integration
- **Web Scraping** - Firecrawl API for website content extraction
- **Google Docs** - Read and extract content from Google Docs
- **ArXiv** - Research paper search and retrieval
- **Gamma** - Presentation and document generation
- **MCP Integration** - Model Context Protocol support
- **Database Tools** - PostgreSQL and Neo4j integrations

### Tool Documentation

- [AI Tools README](./AI_TOOLS_README.md)
- [Manual Tools Setup](./MANUAL_TOOLS_SETUP.md)
- [MCP Integration](./MCP_INTEGRATION.md)
- [Complete Tools Integration](./COMPLETE_TOOLS_INTEGRATION.md)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- [Vercel CLI](https://vercel.com/docs/cli) (for `vc dev`)

### One-Time Setup

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-gateway-demo)

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy environment variables:
   ```bash
   cp env.example .env.local
   ```
4. Configure your environment variables (see [Environment Variables](#-environment-variables))
5. Link to Vercel project (if using Vercel):
   ```bash
   vc link
   ```

### Running Locally

**Recommended (with Vercel CLI):**
```bash
vc dev
```

**Alternative (standard Next.js):**
```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: If using `pnpm dev` instead of `vc dev`, you'll need to run `vc env pull` periodically to fetch the OIDC authentication token (expires every 12h). The `vc dev` command handles this automatically.

## 🔐 Environment Variables

Copy `env.example` to `.env.local` and configure the following:

### Required

```bash
# Vercel AI Gateway (required)
AI_GATEWAY_API_KEY=your_gateway_api_key_here

# v0 API Key (required for studios)
V0_API_KEY=your_v0_api_key_here

# NextAuth (required for authentication)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### Optional (Feature-Specific)

```bash
# Cerebras (for Cerebras models & carbon comparisons)
CEREBRAS_API_KEY=your_cerebras_api_key_here

# Neo4j (for health trackers and graph storage)
NEO4J_URI=bolt+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=your_username
NEO4J_PASSWORD=your_password

# Neon PostgreSQL (for database features)
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require

# E2B (for Python code execution)
E2B_API_KEY=your_e2b_api_key_here

# ElevenLabs (for voice features)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Exa Search (for web search)
EXA_API_KEY=your_exa_api_key_here

# Firecrawl (for web scraping)
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Gamma (for presentations)
GAMMA_API_KEY=sk-gamma-your-api-key-here

# SendGrid (for email notifications)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Google Docs (for document reading)
GOOGLE_CREDENTIALS_PATH=/path/to/service-account-key.json

# MCP (for Model Context Protocol)
MCP_TRANSPORT=http
MCP_SERVER_URL=your_mcp_server_url
MCP_API_KEY=your_mcp_api_key
```

See `env.example` for complete configuration options.

## 📚 Documentation

### Quick Start Guides

- [Getting Started with Database](./GETTING_STARTED_DATABASE.md)
- [Quick Start Auth](./QUICK_START_AUTH.md)
- [Studio Quick Start](./STUDIO_QUICK_START.md)
- [ElevenLabs Quick Start](./ELEVENLABS_QUICK_START.md)
- [GPT OSS 120B Quick Start](./GPT_OSS_120B_QUICK_START.md)

### Setup Guides

- [Cerebras Setup](./CEREBRAS_SETUP.md)
- [Database Setup](./DATABASE_SETUP.md)
- [Neon DB Integration](./NEON_DB_INTEGRATION.md)
- [Storage Setup](./STORAGE_SETUP.md)
- [Authentication Setup](./AUTHENTICATION_SETUP.md)
- [v0 SDK Setup](./V0_SDK_SETUP.md)

### Feature Documentation

- [AI Elements](./AI_ELEMENTS.md)
- [AI Tools](./AI_TOOLS_README.md)
- [v0 Clone](./V0_CLONE_README.md)
- [v0 Studio](./V0_STUDIO_README.md)
- [Textbook Studio](./TEXTBOOK_STUDIO_SETUP.md)
- [Health Chat Tools](./HEALTH_CHAT_TOOLS.md)
- [MCP Integration](./MCP_INTEGRATION.md)

### Troubleshooting

- [GPT OSS 120B Troubleshooting](./GPT_OSS_120B_TROUBLESHOOTING.md)
- [Cerebras Troubleshooting](./CEREBRAS_SETUP.md)

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── business/          # Business studio pages
│   ├── education/         # Education studio pages
│   ├── health/            # Health coach pages
│   ├── sustainability/    # Sustainability studio pages
│   ├── textbook-studio/   # Textbook studio pages
│   └── v0-clone/          # v0 clone interface
├── components/            # React components
│   ├── ai-elements/      # AI Elements UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature-specific components
├── lib/                   # Utility functions and configurations
├── hooks/                 # React hooks
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🧪 Testing

Run type checking:
```bash
pnpm type-check
```

Run linting:
```bash
pnpm lint
```

Test tools integration:
```bash
pnpm test:tools
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Configure environment variables in the Vercel dashboard
4. Deploy!

The project is optimized for Vercel deployment with:
- Serverless API routes
- Edge runtime support
- Automatic environment variable management
- OIDC token auto-refresh

## 🔒 Authentication

The application supports multiple authentication strategies:

- **Anonymous** - No account required (limited features)
- **Guest** - Session-based temporary accounts
- **Registered** - Full account with persistence

See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed setup instructions.

## 📊 Database Features

### PostgreSQL (Neon)

Used for:
- User authentication and sessions
- Chat history and projects
- Usage tracking and billing
- General data persistence

### Neo4j

Used for:
- Health trackers and relationships
- Graph-based data storage
- Complex relationship queries

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for setup instructions.

## 🤝 Contributing

Contributions are welcome! This repository is maintained by the [Vercel](https://vercel.com) team and community contributors.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

See [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai)
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
- [v0.dev](https://v0.dev)
- [shadcn/ui](https://ui.shadcn.com)
- All the AI providers and tool integrations

## 📞 Support

- Check existing [documentation](./) files
- Review [troubleshooting guides](./GPT_OSS_120B_TROUBLESHOOTING.md)
- Open an issue on GitHub

---

**Built with ❤️ by the Vercel team and community**
