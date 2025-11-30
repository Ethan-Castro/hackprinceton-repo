/**
 * Permanent Preview Endpoint
 * Serves publicly accessible preview HTML for deployed components
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/neon";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const previewId = id;

    if (!previewId) {
      return new NextResponse("Preview ID required", { status: 400 });
    }

    // Fetch preview from database
    const result = await query<{
      component_html: string;
      deployment_status: string;
      model_used: string;
      created_at: string;
    }>(
      `SELECT component_html, deployment_status, model_used, created_at
       FROM v0_deployments
       WHERE preview_id = $1`,
      [previewId]
    );

    if (result.length === 0) {
      return new NextResponse("Preview not found", { status: 404 });
    }

    const preview = result[0];

    // Check if preview is active
    if (preview.deployment_status !== "active") {
      return new NextResponse("Preview unavailable", { status: 410 });
    }

    // Return HTML with proper content type
    return new NextResponse(preview.component_html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Generated-By": preview.model_used || "AI",
        "X-Created-At": preview.created_at,
      },
    });
  } catch (error) {
    console.error("[Preview API] Error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
