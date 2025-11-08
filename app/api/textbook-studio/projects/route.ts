/**
 * V0 Projects API Routes
 * Handles creating and listing v0 projects with ownership tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/neon";
import { v0 } from "v0-sdk";

/**
 * GET /api/textbook-studio/projects
 * List all projects for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get all project IDs owned by this user
    const projectOwnerships = await query<{ v0_project_id: string }>(
      `SELECT v0_project_id FROM project_ownership
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    if (projectOwnerships.length === 0) {
      return NextResponse.json({ projects: [] });
    }

    // Fetch project details from v0 API for each project ID
    const projects = [];
    for (const ownership of projectOwnerships) {
      try {
        const project = await v0.projects.getById({ projectId: ownership.v0_project_id });
        projects.push(project);
      } catch (error) {
        console.error(
          `Failed to fetch project ${ownership.v0_project_id}:`,
          error
        );
        // Continue with other projects even if one fails
      }
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/textbook-studio/projects
 * Create a new v0 project
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Create project via v0 API
    const project = await v0.projects.create({
      name,
    });

    // Store ownership in database (cast project to any to access id)
    await query(
      `INSERT INTO project_ownership (user_id, v0_project_id)
       VALUES ($1, $2)`,
      [userId, (project as any).id]
    );

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
