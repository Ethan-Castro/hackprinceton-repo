# Vercel AI Gateway Demo - Augment

A comprehensive Next.js application demonstrating the power of the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) with the [Vercel AI SDK](https://sdk.vercel.ai). This project showcases multi-provider AI integration, domain-specific studios, voice capabilities, and advanced tooling across health, business, education, and sustainability domains.

## 🚀 Live Demo

**Production URL**: [https://vercel.com/ethan-6436s-projects/augment-hack](https://vercel.com/ethan-6436s-projects/augment-hack)

## ✨ Features

### Core Capabilities

- **Multi-Provider AI Support** - Seamlessly switch between multiple AI providers through Vercel AI Gateway
- **Voice Integration** - Text-to-speech and speech-to-text with ElevenLabs
- **AI Elements Components** - Rich UI components for enhanced chat experiences (Shimmer, Plan, Task, Artifact, WebPreview)
- **Domain-Specific Studios** - Specialized AI interfaces for different use cases
- **Tool Integration** - MCP, code execution, web scraping, database queries, and more
- **Authentication** - NextAuth integration with multiple auth strategies (Anonymous, Guest, Registered)
- **Database Integration** - PostgreSQL (Neon) and Neo4j support
- **PWA Support** - Progressive Web App capabilities (currently disabled in build)
- **Command Palette** - Quick navigation and search
- **Onboarding Flow** - Welcome experience for new users

### Available Studios & Features

| Feature | Route | Description |
|---------|-------|-------------|
| **Main Chat** | `/` | General-purpose AI chatbot with multi-provider support |
| **Education Studio** | `/education/studio` | Generate quizzes, lessons, courses, and learning apps |
| **Health Coach** | `/health` | Health advice, report analysis, fitness planning, trackers |
| **Business Studio** | `/business/studio` | Analytics dashboards, CRM tools, business reports, strategy |
| **Sustainability Studio** | `/sustainability/studio` | Carbon tracking, ESG reports, impact analysis |
| **Business Analyst** | `/business-analyst` | Data analysis with Python code execution (E2B) |
| **v0 Clone** | `/v0-clone` | Generic UI generation interface |
| **Textbook Studio** | `/textbook-studio` | Educational content creation platform with authentication |
| **Playground** | `/playground` | Experimental features and testing |
| **DB Demo** | `/db-demo` | Database integration examples |
| **Experiments** | `/experiments` | Experimental features |

### Additional Pages

- **Health Pages**: `/health/insights`, `/health/records`, `/health/treatment`, `/health/for-devs`
- **Business Pages**: `/business/analytics`, `/business/reports`, `/business/strategy`
- **Education Pages**: `/education/courses`, `/education/quizzes`, `/education/study`
- **Sustainability Pages**: `/sustainability/carbon`, `/sustainability/esg`, `/sustainability/impact`, `/sustainability/initiatives`, `/sustainability/workflow`, `/sustainability/ai-energy-resources`

## 🎯 Supported AI Providers

This demo supports multiple AI providers through the Vercel AI Gateway:

- **Amazon** - Nova models
- **Anthropic** - Claude Sonnet 4.5, Claude Haiku 4.5
- **Cerebras** - Llama 3.1/3.3, GPT-OSS 120B, Qwen models ([Setup Guide](./CEREBRAS_SETUP.md))
- **Google** - Gemini 2.5 Flash, Gemma models
- **Meta** - Llama models
- **Mistral** - Mistral models
- **Moonshot AI** - Kimi K2 Thinking Turbo
- **OpenAI** - GPT models
- **xAI** - Grok 4 Fast Non-Reasoning

### Default Model

The default model is `cerebras/gpt-oss-120b`. See `lib/constants.ts` for all supported models.

## 🎙️ Voice Features

**ElevenLabs Integration**
- **Voice Input**: Click the microphone icon to speak your questions
- **Text-to-Speech**: Hover over AI responses and click the speaker icon to hear them read aloud
- **Voice Reminders**: Health appointment and medication reminders via voice calls

[Quick Start Guide](./ELEVENLABS_QUICK_START.md) | [Full Documentation](./ELEVENLABS_INTEGRATION.md)

## 🧩 AI Elements Components

Enhanced UI components for better chat experiences:

- **Shimmer** - Animated loading states for streaming content
- **Plan** - Collapsible execution plans with streaming support
- **Task** - Task lists with progress indicators
- **Artifact** - Display code, documents, and structured content
- **WebPreview** - Live web page previews with navigation
- **Context** - Contextual information display
- **Inline Citation** - Citation and reference management

See [AI_ELEMENTS.md](./AI_ELEMENTS.md) for detailed documentation and usage examples.

## 🛠️ Tools & Integrations

### Available Tools

- **Code Execution** - Python code execution via E2B (NumPy, Pandas, Matplotlib, etc.)
- **Web Search** - Exa Search API integration for intelligent web search
- **Web Scraping** - Firecrawl API for website content extraction
- **Google Docs** - Read and extract content from Google Docs
- **ArXiv** - Research paper search and retrieval
- **Gamma** - Presentation and document generation
- **MCP Integration** - Model Context Protocol support (HTTP, SSE, stdio transports)
- **Database Tools** - PostgreSQL (Neon) and Neo4j integrations
- **SQL Tools** - Execute SQL queries and visualize results
- **Chart Tools** - Generate charts and visualizations
- **Canvas Tools** - Drawing and canvas manipulation
- **Health Tools** - Medical research, appointments, medications, provider insurance
- **Business Tools** - Analytics, reporting, CRM functionality
- **Export Tools** - Export content to various formats (PDF, Excel, etc.)
- **Parallel AI** - Parallel processing capabilities

### Tool Documentation

- [AI Tools README](./AI_TOOLS_README.md)
- [Manual Tools Setup](./MANUAL_TOOLS_SETUP.md)
- [MCP Integration](./MCP_INTEGRATION.md)
- [Complete Tools Integration](./COMPLETE_TOOLS_INTEGRATION.md)

## 📡 API Routes

The application exposes the following API endpoints:

### Core APIs
- `POST /api/chat` - Main chat endpoint
- `GET /api/models` - List available AI models
- `GET /api/db-init/status` - Check database connection status
- `POST /api/db-init` - Initialize database tables

### Domain-Specific APIs
- `POST /api/business-analyst-chat` - Business analyst chat with Python execution
- `POST /api/health-chat` - Health coach chat endpoint
- `POST /api/v0-chat` - v0 chat interface
- `POST /api/v0-deploy` - Deploy generated UIs

### Feature APIs
- `POST /api/stt` - Speech-to-text (ElevenLabs)
- `POST /api/tts` - Text-to-speech (ElevenLabs)
- `POST /api/carbon/estimate` - Carbon footprint estimation
- `POST /api/cerebras-ui-gen` - Cerebras UI generation
- `GET /api/reports` - Generate reports

### Textbook Studio APIs
- `GET /api/textbook-studio/projects` - List projects
- `POST /api/textbook-studio/projects` - Create project
- `GET /api/textbook-studio/projects/[projectId]` - Get project details
- `GET /api/textbook-studio/chats` - List chats
- `POST /api/textbook-studio/chats` - Create chat

### Health APIs
- `GET /api/trackers` - List health trackers
- `POST /api/trackers` - Create tracker
- `GET /api/trackers/[id]/entries` - Get tracker entries
- `POST /api/trackers/[id]/entries` - Add tracker entry

### Authentication APIs
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/auth/register` - User registration

### Usage & Billing APIs
- `GET /api/usage` - Usage statistics
- `GET /api/usage/billing` - Billing information

### Template APIs
- `POST /api/templates/[id]/generate` - Generate from template

### Database Example APIs
- `GET /api/db-example` - Test database connection
- `POST /api/db-example` - Create test record

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- [Vercel CLI](https://vercel.com/docs/cli) (for `vc dev`)

### One-Time Setup

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-gateway-demo)

1. Clone this repositoryash
   git clone <repository-url>
   cd vercel-ai-gateway-demo1
   2. Install dependencies:
  
   pnpm install
   3. Copy environment variables:
   cp env.example .env.local
   4. Configure your environment variables (see [Environment Variables](#-environment-variables))

5. Link to Vercel project (if using Vercel):
   vc link
   6. Initialize database (if using database features):
   # Check database status
   curl http://localhost:3000/api/db-init/status
   
   # Initialize database tables
   curl -X POST http://localhost:3000/api/db-init
   ### Running Locally

**Recommended (with Vercel CLI):**
vc dev**Alternative (standard Next.js):**
pnpm devThen open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: If using `pnpm dev` instead of `vc dev`, you'll need to run `vc env pull` periodically to fetch the OIDC authentication token (expires every 12h). The `vc dev` command handles this automatically.

## 🔐 Environment Variables

Copy `env.example` to `.env.local` and configure the following:

### Required
ash
# Vercel AI Gateway (required)
AI_GATEWAY_API_KEY=your_gateway_api_key_here

# v0 API Key (required for studios)
V0_API_KEY=your_v0_api_key_here

# NextAuth (required for authentication)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000### Optional (Feature-Specific)
ash
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

# Parallel AI (for parallel processing)
PARALLEL_API_KEY=your_parallel_api_key_hereSee `env.example` for complete configuration options.

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
