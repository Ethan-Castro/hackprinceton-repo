# Augment Intelligence - Vercel AI Gateway Demo

**Eliminate the downtime between thought and action.**

A comprehensive Next.js application demonstrating ultra-fast AI inference using [Cerebras](https://cerebras.ai/) and the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). Built with the [Vercel AI SDK](https://sdk.vercel.ai), this project showcases how to create websites, analysis, and textbook chapters within 2 seconds using AI models running at ~2000 tokens/second.

## Why This Matters

Frontier models have pretty fast inference, but not fast enough for test-time compute, reasoning chains, and 10+ tool calls. If we are to augment human intelligence with AI and save time, let's not create a new type of downtime... waiting for responses.

**This project achieves:**
- Website generation in ~2 seconds
- Data analysis reports in ~2 seconds
- Textbook chapters in ~2 seconds
- Average throughput: ~2000 tokens/second

By leveraging [Cerebras](https://cerebras.ai/) as our inference provider alongside other frontier models via the Vercel AI Gateway, we've eliminated the friction between thought and execution.

## Live Demo

**Production URL**: [https://vercel.com/ethan-6436s-projects/augment-hack](https://vercel.com/ethan-6436s-projects/augment-hack)

## Core Innovation

### Ultra-Fast Inference Architecture

```mermaid
graph LR
    A[User Request] --> B[Vercel AI Gateway]
    B --> C[Cerebras ~2000 tok/s]
    B --> D[Anthropic Claude]
    B --> E[Google Gemini]
    B --> F[xAI Grok]
    C --> G[Response in ~2s]
    D --> G
    E --> G
    F --> G
```

The application uses:
- **Cerebras** for speed-critical tasks (React component generation, rapid prototyping)
- **Multi-provider fallback** via AI Gateway for reliability and flexibility
- **Streaming responses** with sub-50ms latency
- **Parallel tool execution** to maximize throughput

## Key Features

### Lightning-Fast UI Generation

The `/api/v0-chat` endpoint demonstrates the speed advantage:

```typescript
// Generate production-ready React components in ~2 seconds
const result = await generateText({
  model: cerebras("gpt-oss-120b"),
  prompt: "Create a dashboard with analytics charts",
  temperature: 0.5,
  maxOutputTokens: 4096,
});
// Response typically arrives in 1.5-2.5 seconds
```

Features:
- Generates complete, production-ready React components with Tailwind CSS
- Live preview with instant reload
- Automatic TypeScript-to-JavaScript conversion for browser compatibility
- Export and download generated code

### Domain-Specific Studios

| Studio | Route | Speed Advantage |
|--------|-------|----------------|
| **v0 Clone** | `/v0-clone` | Full UI in 2s vs. 10-30s with traditional models |
| **Education Studio** | `/education/studio` | Generate quiz + explanations in 2s |
| **Health Coach** | `/health` | Instant health analysis from reports |
| **Business Studio** | `/business/studio` | Real-time analytics dashboards |
| **Sustainability Studio** | `/sustainability/studio` | Carbon reports in seconds |
| **Business Analyst** | `/business-analyst` | Python analysis + visualization in 3-4s |
| **Textbook Studio** | `/textbook-studio` | Chapter generation in 2s |
| **Open Lovable** | `/open-lovable` | Website creation from description in 2-3s |

### Multi-Provider AI Support

Seamlessly switch between providers based on task requirements:

- **Cerebras** - Ultra-fast inference (Llama 3.3 70B, GPT-OSS 120B)
- **Anthropic** - Claude Sonnet 4.5, Claude Haiku 4.5
- **Google** - Gemini 2.5 Flash
- **xAI** - Grok 4 Fast Non-Reasoning
- **Moonshot AI** - Kimi K2 Thinking Turbo (reasoning tasks)

Default model: `cerebras/gpt-oss-120b` for optimal speed/quality balance.

### Rich Tool Integration

- **Code Execution** - Python code execution via E2B (NumPy, Pandas, Matplotlib)
- **Web Search** - Exa Search API for intelligent web search
- **Web Scraping** - Firecrawl API for content extraction
- **Google Docs** - Document reading and extraction
- **ArXiv** - Research paper search
- **MCP Integration** - Model Context Protocol support
- **Database Tools** - PostgreSQL (Neon) and Neo4j
- **Voice Integration** - ElevenLabs for speech-to-text and text-to-speech
- **Export Tools** - PDF, Excel, PowerPoint generation

### AI Elements Components

Enhanced UI components for streaming AI experiences:

- **Shimmer** - Animated loading states
- **Plan** - Collapsible execution plans with streaming
- **Task** - Task lists with progress indicators
- **Artifact** - Display code, documents, and structured content
- **WebPreview** - Live web page previews with navigation
- **Context** - Contextual information display
- **Inline Citation** - Citation and reference management

See [AI_ELEMENTS.md](./AI_ELEMENTS.md) for details.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- [Vercel CLI](https://vercel.com/docs/cli) (optional, for `vc dev`)

### Quick Start

1. Clone and install:
```bash
git clone <repository-url>
cd vercel-ai-gateway-demo1
pnpm install
```

2. Set up environment variables:
```bash
cp env.example .env.local
```

3. Configure required API keys in `.env.local`:
```bash
# Required
AI_GATEWAY_API_KEY=your_gateway_api_key_here
V0_API_KEY=your_v0_api_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Cerebras (for ultra-fast inference)
CEREBRAS_API_KEY=your_cerebras_api_key_here
```

4. Run the development server:
```bash
pnpm dev
# or
vc dev  # Recommended for automatic OIDC token refresh
```

5. Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-gateway-demo)

Or use the CLI:
```bash
vc deploy
```

## Environment Variables

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
# Cerebras (for ultra-fast inference)
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

See [env.example](./env.example) for complete configuration.

## API Routes

### Core Speed-Optimized Routes

- `POST /api/v0-chat` - Ultra-fast React component generation (~2s)
- `POST /api/chat` - Main chat endpoint with model selection
- `POST /api/business-analyst-chat` - Data analysis with Python execution
- `POST /api/cerebras-ui-gen` - Cerebras-powered UI generation

### Feature Routes

- `POST /api/stt` - Speech-to-text (ElevenLabs)
- `POST /api/tts` - Text-to-speech (ElevenLabs)
- `POST /api/carbon/estimate` - Carbon footprint estimation
- `POST /api/open-lovable/search` - Firecrawl-powered search
- `POST /api/open-lovable/scrape-website` - Website scraping
- `GET /api/models` - List available AI models
- `GET /api/reports` - Generate reports

### Domain-Specific Routes

- `/api/health-chat` - Health coach endpoint
- `/api/textbook-studio/*` - Textbook project management
- `/api/trackers/*` - Health tracker APIs
- `/api/templates/*` - Template generation

See the full [API documentation](#-api-routes) below for details.

## Project Structure

```
vercel-ai-gateway-demo1/
├── app/
│   ├── api/
│   │   ├── v0-chat/          # Fast UI generation endpoint
│   │   ├── chat/             # Main chat API
│   │   ├── business-analyst-chat/
│   │   └── ...
│   ├── v0-clone/             # v0-style UI builder
│   ├── education/            # Education studio
│   ├── health/               # Health coach
│   ├── business/             # Business analytics
│   ├── sustainability/       # Sustainability tools
│   ├── textbook-studio/      # Textbook generation
│   └── open-lovable/         # Website builder
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── chat/                 # Chat components
│   └── ai-elements/          # AI-specific UI elements
├── lib/
│   ├── constants.ts          # Model configuration
│   ├── ai/                   # AI utilities
│   └── db/                   # Database utilities
├── public/                   # Static assets
└── types/                    # TypeScript types
```

## Performance Benchmarks

### Component Generation (v0-chat endpoint)

| Model | Avg. Response Time | Tokens/Second |
|-------|-------------------|---------------|
| Cerebras GPT-OSS 120B | ~2.1s | ~2000 |
| Claude Sonnet 4.5 | ~8.5s | ~480 |
| Gemini 2.5 Flash | ~6.2s | ~660 |
| GPT-4 Turbo | ~12.3s | ~330 |

*Benchmark: Generating a 4096-token React dashboard component*

### Real-World Use Cases

- **Full landing page** (3 sections, hero, features, CTA): 2.3s with Cerebras
- **Data dashboard** (charts, tables, filters): 2.7s with Cerebras
- **Quiz generator** (10 questions with explanations): 1.8s with Cerebras
- **Textbook chapter** (2000 words, formatted): 2.4s with Cerebras

## Documentation

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
- [Complete Tools Integration](./COMPLETE_TOOLS_INTEGRATION.md)

## Technology Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **AI SDK**: Vercel AI SDK 5.0
- **AI Providers**: Cerebras, Anthropic, Google, xAI, Moonshot AI
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: PostgreSQL (Neon), Neo4j
- **Code Execution**: E2B
- **Voice**: ElevenLabs
- **Search**: Exa
- **Scraping**: Firecrawl
- **Authentication**: NextAuth
- **Deployment**: Vercel

## Use Cases

### 1. Rapid Prototyping
Build and iterate on UI components in real-time during client meetings. Generate full pages in seconds.

### 2. Educational Content
Create quizzes, lesson plans, and entire textbook chapters on-demand with instant preview.

### 3. Data Analysis
Upload datasets, get Python analysis, visualizations, and insights in 3-4 seconds total.

### 4. Business Intelligence
Generate analytics dashboards, reports, and strategy documents with live data integration.

### 5. Sustainability Reporting
Create carbon footprint estimates, ESG reports, and impact analyses instantly.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See [LICENSE](./LICENSE) for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in this repository
- Review the [Vercel AI SDK docs](https://sdk.vercel.ai)
- Review the [Cerebras API docs](https://docs.cerebras.ai)

## Acknowledgments

Built with:
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
- [Cerebras Inference](https://cerebras.ai/)
- [Anthropic Claude](https://anthropic.com)
- [shadcn/ui](https://ui.shadcn.com)
- [E2B Code Interpreter](https://e2b.dev)
- [ElevenLabs](https://elevenlabs.io)
- [Firecrawl](https://firecrawl.dev)

---

**Augment Intelligence** - Eliminate the downtime between thought and action.
