/**
 * V0 Project Detail API Route
 * Get details for a specific project
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { queryOne } from "@/lib/neon";
import { v0 } from "v0-sdk";

/**
 * GET /api/textbook-studio/projects/[projectId]
 * Get details for a specific project
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const projectId = params.projectId;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if user owns this project
    const ownership = await queryOne<{ v0_project_id: string }>(
      `SELECT v0_project_id FROM project_ownership
       WHERE user_id = $1 AND v0_project_id = $2`,
      [userId, projectId]
    );

    if (!ownership) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch project from v0 API
    const project = await v0.projects.getById({ projectId });

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}
