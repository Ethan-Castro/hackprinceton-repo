import { NextResponse } from "next/server";
import { getLatestGenerationId } from "@/lib/gateway";

export async function GET() {
  const generationId = getLatestGenerationId();

  console.log(`[Latest ID API] Returning generation ID: ${generationId}`);

  return NextResponse.json({ generationId });
}
