import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey =
      process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 401 }
      );
    }

    const response = await fetch("https://ai-gateway.vercel.sh/v1/credits", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch credits: ${response.statusText}`);
    }

    const credits = await response.json();
    return NextResponse.json(credits);
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits data" },
      { status: 500 }
    );
  }
}
