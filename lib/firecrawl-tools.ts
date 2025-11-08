import { tool as createTool } from "ai";
import { z } from "zod";
import FirecrawlApp from "@mendable/firecrawl-js";

// Lazy initialization - only create client when needed
let firecrawlClient: FirecrawlApp | null = null;

function getFirecrawlClient(): FirecrawlApp {
  if (!firecrawlClient) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY environment variable is not set");
    }
    firecrawlClient = new FirecrawlApp({ apiKey });
  }
  return firecrawlClient;
}

export type ScrapedContent = {
  title?: string;
  url: string;
  markdown?: string;
  html?: string;
  length: number;
};

export type FirecrawlToolOutput = {
  url: string;
  content: ScrapedContent;
  success: boolean;
};

export const scrapeWebsite = createTool({
  description:
    "Scrape content from any website URL using Firecrawl. Extracts structured data, text, and HTML from web pages.",
  inputSchema: z.object({
    url: z
      .string()
      .url()
      .describe("The URL of the website to scrape"),
    format: z
      .enum(["markdown", "html", "both"])
      .default("markdown")
      .describe("Format to extract (markdown, html, or both)"),
  }),
  execute: async ({
    url,
    format = "markdown",
  }): Promise<FirecrawlToolOutput> => {
    try {
      const firecrawl = getFirecrawlClient();
      const formats =
        format === "both" ? ["markdown", "html"] : [format];

      const result = await firecrawl.scrape(url, {
        formats: formats as any,
      });

      if (!result.success) {
        throw new Error("Scraping failed");
      }

      return {
        url,
        success: true,
        content: {
          title: result.metadata?.title,
          url: url,
          markdown:
            result.markdown?.slice(0, 2000) ||
            undefined,
          html: result.html?.slice(0, 2000) || undefined,
          length: result.markdown?.length || 0,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Web scraping failed: ${errorMessage}`);
    }
  },
});

export const firecrawlTools = {
  scrapeWebsite,
};
