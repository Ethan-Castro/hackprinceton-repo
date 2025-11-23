import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "FIRECRAWL_API_KEY is not configured",
          results: [],
        },
        { status: 500 },
      );
    }

    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        limit: 8,
        scrapeOptions: {
          formats: ["markdown", "screenshot"],
          onlyMainContent: true,
        },
      }),
    });

    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    const results =
      searchData.data?.map((result: any) => ({
        url: result.url,
        title: result.title || result.url,
        description: result.description || "",
        screenshot: result.screenshot || null,
        markdown: result.markdown || "",
      })) ?? [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[open-lovable][search] error", error);
    return NextResponse.json(
      { error: "Failed to perform search", results: [] },
      { status: 500 },
    );
  }
}
