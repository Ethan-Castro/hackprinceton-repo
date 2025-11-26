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

    const result = scrapeResult as any;
    if (result.success === false) {
      return NextResponse.json(
        { error: `Failed to scrape URL: ${result.error || "Unknown error"}` },
        { status: 500 }
      );
    }

    const data = result.data || result;
    return NextResponse.json({
      text: data.markdown || "",
      title: data.metadata?.title,
      description: data.metadata?.description,
    });
  } catch (error: any) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scrape URL" },
      { status: 500 }
    );
  }
}

