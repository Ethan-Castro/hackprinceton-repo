# MCP Integration for Health Chat

This document explains how Model Context Protocol (MCP) has been integrated into the Health Chat feature.

## Overview

The Health Chat now supports MCP servers, allowing you to connect to external medical research tools, health databases, and specialized health information services through a standardized protocol.

## What is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that connects AI applications to a growing ecosystem of tools and integrations. With MCP support, you can access hundreds of pre-built tools ("servers") that add powerful functionality to your application.

## Architecture

The MCP integration consists of three main components:

1. **MCP Client** ([lib/mcp-client.ts](lib/mcp-client.ts))
   - Handles connection to MCP servers
   - Supports multiple transport types (HTTP, SSE, stdio)
   - Provides tool discovery and execution

2. **Health Chat API** ([app/api/health-chat/route.ts](app/api/health-chat/route.ts))
   - Integrates MCP tools with existing health tools
   - Manages MCP client lifecycle
   - Merges MCP tools with base functionality

3. **Health Pages** ([app/health/**/page.tsx](app/health))
   - All health section pages use the health-chat API endpoint
   - Consistent MCP tool access across all health features

## Configuration

### Environment Variables

Configure your MCP server connection in your `.env.local` file:

```bash
# Transport type: http, sse, or stdio
MCP_TRANSPORT=http

# For HTTP/SSE transport (recommended for production):
MCP_SERVER_URL=https://your-mcp-server.com/mcp
MCP_API_KEY=your_api_key_here

# For stdio transport (local development only):
# MCP_COMMAND=node
# MCP_ARGS=path/to/your/mcp-server.js
```

### Transport Types

#### 1. HTTP Transport (Recommended)

Best for production deployments. Supports API key authentication.

```bash
MCP_TRANSPORT=http
MCP_SERVER_URL=https://your-mcp-server.com/mcp
MCP_API_KEY=your_api_key_here
```

#### 2. SSE Transport

Server-Sent Events transport with OAuth support.

```bash
MCP_TRANSPORT=sse
MCP_SERVER_URL=https://your-server.com/sse
MCP_API_KEY=your_api_key_here
```

#### 3. Stdio Transport (Local Development)

For local MCP servers during development.

```bash
MCP_TRANSPORT=stdio
MCP_COMMAND=node
MCP_ARGS=src/mcp-server/index.js
```

## MCP Server Options

### Option 1: Using an Existing MCP Server

There are many pre-built MCP servers available:

- **medical-mcp** - Medical information from FDA, WHO, PubMed, etc.
- **health-record-mcp** - SMART on FHIR EHR integration
- **healthcare-mcp-public** - Clinical trials, ICD-10, medical calculators
- **researcher-mcp** - Research assistant with Perplexity AI integration

### Option 2: Creating Your Own MCP Server

You can create a custom MCP server for your specific health research needs. See the [MCP documentation](https://modelcontextprotocol.io/docs) for details.

## Example: Connecting to a Health Research MCP

### Step 1: Obtain MCP Server Access

If using a hosted MCP server, sign up and get your API credentials.

### Step 2: Configure Environment

```bash
MCP_TRANSPORT=http
MCP_SERVER_URL=https://health-research-mcp.example.com/mcp
MCP_API_KEY=hrm_abc123xyz789
```

### Step 3: Restart Your Application

```bash
pnpm dev
```

### Step 4: Use Health Chat

Navigate to any Health section page:
- [/health](http://localhost:3000/health) - Health Chat
- [/health/records](http://localhost:3000/health/records) - Medical Records
- [/health/treatment](http://localhost:3000/health/treatment) - Treatment Plans
- [/health/insights](http://localhost:3000/health/insights) - Health Insights

The MCP tools will be automatically available to the AI assistant!

## How It Works

1. **Request Initiation**: User sends a message in Health Chat
2. **MCP Client Creation**: Health Chat API creates an MCP client connection
3. **Tool Discovery**: Client retrieves available tools from the MCP server
4. **Tool Merging**: MCP tools are merged with existing health tools
5. **AI Processing**: The AI model can now use both local and MCP tools
6. **Cleanup**: MCP client connection is closed when response completes

## Available Tools

### Base Health Tools (Always Available)

- `browseUrl` - Fetch and analyze web-based medical information
- `saveTrackerEntry` - Persist health tracking data
- `indexReport` - Store medical reports for reference
- `displayArtifact` - Show structured content with copy/download
- `displayWebPreview` - Display web previews
- `generateHtmlPreview` - Create interactive HTML demos

### MCP Tools (When Configured)

MCP tools vary depending on your connected server. Common examples:

- Medical literature search
- Drug interaction checking
- Clinical trial lookup
- Health record access
- Medical calculation tools
- Disease information retrieval

## Troubleshooting

### MCP Tools Not Available

If MCP tools aren't showing up:

1. Check your `.env.local` configuration
2. Verify MCP_SERVER_URL is accessible
3. Check API key is valid
4. Review server logs for connection errors
5. Test MCP server connectivity separately

### Connection Issues

```
Failed to create MCP client: [error details]
```

**Solutions:**
- Verify network connectivity to MCP server
- Check firewall settings
- Ensure API key has proper permissions
- Try switching to a different transport type

### Tool Execution Failures

If MCP tools fail during execution:
- Check tool parameter validation
- Review MCP server logs
- Verify tool permissions
- Ensure required dependencies are available

## Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **HTTPS Only**: Always use HTTPS for HTTP/SSE transports
3. **Input Validation**: MCP servers should validate all tool inputs
4. **Rate Limiting**: Implement rate limiting for production deployments
5. **Access Control**: Use proper authentication for MCP servers

## Development

### Testing MCP Integration

1. Start the development server:
```bash
pnpm dev
```

2. Navigate to [http://localhost:3000/health](http://localhost:3000/health)

3. Try health-related queries to test MCP tool usage

### Adding New MCP Servers

To add additional MCP servers or customize the integration:

1. Modify [lib/mcp-client.ts](lib/mcp-client.ts)
2. Add configuration options as needed
3. Update [app/api/health-chat/route.ts](app/api/health-chat/route.ts) if custom handling is required

## Resources

- [MCP Official Documentation](https://modelcontextprotocol.io)
- [Vercel AI SDK MCP Guide](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- [Medical MCP Servers](https://github.com/sunanhe/awesome-medical-mcp-servers)

## Next Steps

1. **Find Your MCP Server**: Identify which MCP server matches your needs
2. **Configure Connection**: Add server details to `.env.local`
3. **Test Integration**: Try health queries that leverage MCP tools
4. **Monitor Usage**: Track tool usage and performance
5. **Iterate**: Refine based on user needs and feedback
