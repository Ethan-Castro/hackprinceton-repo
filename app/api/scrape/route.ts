import { NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Missing 'url' in body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "FIRECRAWL_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    const app = new FirecrawlApp({ apiKey });

    const scrapeResult = await app.scrape(url, {
      formats: ["markdown"],
    });

    if (!scrapeResult.success) {
      return NextResponse.json(
        { error: `Failed to scrape URL: ${(scrapeResult as any).error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text: scrapeResult.markdown || "",
      title: scrapeResult.metadata?.title,
      description: scrapeResult.metadata?.description,
    });
  } catch (error: any) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scrape URL" },
      { status: 500 }
    );
  }
}

