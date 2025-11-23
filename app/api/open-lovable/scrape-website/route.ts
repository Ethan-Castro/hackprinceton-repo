import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";

export async function POST(request: NextRequest) {
  try {
    const { url, formats = ["markdown", "html"], options = {} } =
      await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      console.error("[open-lovable][scrape-website] FIRECRAWL_API_KEY missing");
      return NextResponse.json(
        {
          success: true,
          data: {
            title: "Example Website",
            content: `This is a mock response for ${url}. Configure FIRECRAWL_API_KEY to enable real scraping.`,
            description: "A sample website",
            markdown: `# Example Website\n\nThis is mock content for demonstration purposes.`,
            html: `<h1>Example Website</h1><p>This is mock content for demonstration purposes.</p>`,
            metadata: {
              title: "Example Website",
              description: "A sample website",
              sourceURL: url,
              statusCode: 200,
            },
          },
        },
        { status: 200 },
      );
    }

    const app = new FirecrawlApp({ apiKey });

    const scrapeResult = await app.scrape(url, {
      formats,
      onlyMainContent: options.onlyMainContent !== false,
      waitFor: options.waitFor || 2000,
      timeout: options.timeout || 30000,
      ...options,
    });

    const result = scrapeResult as any;
    if (result.success === false) {
      throw new Error(result.error || "Failed to scrape website");
    }

    const data = result.data || result;

    return NextResponse.json({
      success: true,
      data: {
        title: data?.metadata?.title || "Untitled",
        content: data?.markdown || data?.html || "",
        description: data?.metadata?.description || "",
        markdown: data?.markdown || "",
        html: data?.html || "",
        metadata: data?.metadata || {},
        screenshot: data?.screenshot || null,
        links: data?.links || [],
        raw: data,
      },
    });
  } catch (error) {
    console.error("[open-lovable][scrape-website] error", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to scrape website",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
