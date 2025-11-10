import { tool as createTool } from "ai";
import { z } from "zod";
import Exa from "exa-js";

// Lazy initialization - only create client when needed
let exaClient: Exa | null = null;

function getExaClient(): Exa {
  if (!exaClient) {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new Error("EXA_API_KEY environment variable is not set");
    }
    exaClient = new Exa(apiKey);
  }
  return exaClient;
}

export type SearchResult = {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
};

export type SearchToolOutput = {
  query: string;
  results: SearchResult[];
  totalResults?: number;
};

export const webSearch = createTool({
  description:
    "Search the web for up-to-date information using Exa. Use this to find recent news, articles, and web content.",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .max(200)
      .describe("The search query to find information about"),
    numResults: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(5)
      .describe("Number of results to return (1-10)"),
  }),
  execute: async ({ query, numResults = 5 }): Promise<SearchToolOutput> => {
    try {
      const exa = getExaClient();
      const { results } = await exa.searchAndContents(query, {
        livecrawl: "always",
        numResults,
        type: "keyword",
      });

      return {
        query,
        results: results.map((result) => ({
          title: result.title || "Untitled",
          url: result.url,
          content: `${result.author ? `By ${result.author}. ` : ""}Visit ${result.url} for more information.`,
          publishedDate: result.publishedDate,
        })),
        totalResults: results.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Web search failed: ${errorMessage}`);
    }
  },
});

export const exaTools = {
  webSearch,
};
