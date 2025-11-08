import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * MCP Client Configuration for Health Research
 *
 * This module provides a flexible MCP client that can connect to various
 * health research MCP servers using different transport methods.
 *
 * Supported transports:
 * - HTTP: For production MCP servers (recommended)
 * - SSE: Server-Sent Events for streaming
 * - stdio: For local development with local MCP servers
 */

export type MCPTransportType = 'http' | 'sse' | 'stdio';

export interface MCPConfig {
  transport: MCPTransportType;
  url?: string;
  headers?: Record<string, string>;
  command?: string;
  args?: string[];
}

/**
 * Create an MCP client for health research tools
 *
 * @param config - Configuration for the MCP client
 * @returns MCP client instance with tools() and close() methods
 */
export async function createHealthMCPClient(config?: MCPConfig) {
  // Default to HTTP transport if not specified
  const transportType = config?.transport || process.env.MCP_TRANSPORT || 'http';

  try {
    switch (transportType) {
      case 'http': {
        const url = config?.url || process.env.MCP_SERVER_URL;
        if (!url) {
          console.warn('MCP_SERVER_URL not configured. MCP tools will not be available.');
          return null;
        }

        const headers = config?.headers || {};
        if (process.env.MCP_API_KEY) {
          headers['Authorization'] = `Bearer ${process.env.MCP_API_KEY}`;
        }

        return await createMCPClient({
          transport: {
            type: 'http',
            url,
            headers,
          },
        });
      }

      case 'sse': {
        const url = config?.url || process.env.MCP_SERVER_URL;
        if (!url) {
          console.warn('MCP_SERVER_URL not configured. MCP tools will not be available.');
          return null;
        }

        const headers = config?.headers || {};
        if (process.env.MCP_API_KEY) {
          headers['Authorization'] = `Bearer ${process.env.MCP_API_KEY}`;
        }

        return await createMCPClient({
          transport: {
            type: 'sse',
            url,
            headers,
          },
        });
      }

      case 'stdio': {
        const command = config?.command || process.env.MCP_COMMAND || 'node';
        const args = config?.args || process.env.MCP_ARGS?.split(' ') || [];

        if (!args || args.length === 0) {
          console.warn('MCP stdio command args not configured. MCP tools will not be available.');
          return null;
        }

        return await createMCPClient({
          transport: new StdioClientTransport({
            command,
            args,
          }),
        });
      }

      default:
        console.warn(`Unknown MCP transport type: ${transportType}`);
        return null;
    }
  } catch (error) {
    console.error('Failed to create MCP client:', error);
    return null;
  }
}

/**
 * Get MCP tools for health research
 *
 * This function creates an MCP client and retrieves all available tools.
 * It handles cleanup automatically after tools are retrieved.
 *
 * @returns Object containing tools and close function, or null if MCP is not configured
 */
export async function getHealthMCPTools() {
  const mcpClient = await createHealthMCPClient();

  if (!mcpClient) {
    return null;
  }

  try {
    // Retrieve all available tools from the MCP server
    const tools = await mcpClient.tools();

    return {
      tools,
      close: () => mcpClient.close(),
    };
  } catch (error) {
    console.error('Failed to get MCP tools:', error);
    await mcpClient.close();
    return null;
  }
}
