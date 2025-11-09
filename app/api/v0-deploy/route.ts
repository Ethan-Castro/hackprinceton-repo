import { NextRequest, NextResponse } from "next/server";
import { v0 } from "v0-sdk";

export async function POST(request: NextRequest) {
  try {
    const { projectId, chatId, versionId } = await request.json();

    if (!projectId || !chatId || !versionId) {
      return NextResponse.json(
        { error: "projectId, chatId, and versionId are required" },
        { status: 400 }
      );
    }

    // Check if V0_API_KEY is set
    if (!process.env.V0_API_KEY) {
      return NextResponse.json(
        { 
          error: "V0_API_KEY not configured",
          details: "Please add your v0 API key to .env.local"
        },
        { status: 500 }
      );
    }

    const deployment = await v0.deployments.create({
      projectId,
      chatId,
      versionId,
    });

    return NextResponse.json({
      id: deployment.id,
      apiUrl: deployment.apiUrl,
      webUrl: deployment.webUrl,
      inspectorUrl: deployment.inspectorUrl,
    });
  } catch (error: any) {
    console.error("V0 Deployment Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create deployment",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}

