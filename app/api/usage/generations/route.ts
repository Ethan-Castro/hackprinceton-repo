import { NextResponse } from "next/server";
import { queryWithPostgres } from "@/lib/neon";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch generations from database
    const generations = await queryWithPostgres<{
      id: number;
      generation_id: string;
      model: string | null;
      provider_name: string | null;
      total_cost: number | null;
      tokens_prompt: number | null;
      tokens_completion: number | null;
      latency: number | null;
      generation_time: number | null;
      is_byok: boolean;
      streamed: boolean;
      created_at: Date;
    }>`
      SELECT
        id,
        generation_id,
        model,
        provider_name,
        total_cost,
        tokens_prompt,
        tokens_completion,
        latency,
        generation_time,
        is_byok,
        streamed,
        created_at
      FROM generations
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count
    const countResult = await queryWithPostgres<{ count: string }>`
      SELECT COUNT(*) as count FROM generations
    `;
    const total = parseInt(countResult[0]?.count || "0");

    // For each generation, optionally fetch detailed info from AI Gateway
    // (This is commented out by default to avoid making too many API calls)
    // You can enable this if you want real-time data from the gateway
    /*
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (apiKey) {
      const detailedGenerations = await Promise.all(
        generations.map(async (gen) => {
          try {
            const response = await fetch(
              `https://ai-gateway.vercel.sh/v1/generation?id=${gen.generation_id}`,
              {
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (response.ok) {
              const data = await response.json();
              return { ...gen, details: data.data };
            }
          } catch (error) {
            console.error(`Error fetching details for ${gen.generation_id}:`, error);
          }
          return gen;
        })
      );
      return NextResponse.json({ generations: detailedGenerations, total });
    }
    */

    return NextResponse.json({
      generations,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching generations:", error);
    return NextResponse.json(
      { error: "Failed to fetch generations" },
      { status: 500 }
    );
  }
}
