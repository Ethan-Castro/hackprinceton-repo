import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get("id");

    if (!generationId) {
      return NextResponse.json(
        { error: "Generation ID is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.AI_GATEWAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 401 }
      );
    }

    console.log(`[Generation API] Fetching metrics for ID: ${generationId}`);

    const response = await fetch(
      `https://ai-gateway.vercel.sh/v1/generation?id=${generationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Generation API] Error response: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch generation: ${response.statusText}`);
    }

    const generation = await response.json();
    console.log(`[Generation API] Got metrics:`, {
      id: generation.id,
      latency: generation.latency,
      generation_time: generation.generation_time,
    });
    return NextResponse.json(generation);
  } catch (error) {
    console.error("Error fetching generation:", error);
    return NextResponse.json(
      { error: "Failed to fetch generation data" },
      { status: 500 }
    );
  }
}
