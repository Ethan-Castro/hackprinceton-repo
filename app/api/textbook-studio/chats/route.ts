/**
 * V0 Chats API Routes
 * Handles creating and listing v0 chats with ownership tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/neon";
import { v0 } from "v0-sdk";
import {
  checkChatLimit,
  checkAnonymousChatLimit,
  logAnonymousChat,
} from "@/lib/auth";

/**
 * GET /api/textbook-studio/chats
 * List all chats for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get all chat IDs owned by this user
    const chatOwnerships = await query<{ v0_chat_id: string }>(
      `SELECT v0_chat_id FROM chat_ownership
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    if (chatOwnerships.length === 0) {
      return NextResponse.json({ chats: [] });
    }

    // Fetch chat details from v0 API for each chat ID
    const chats = [];
    for (const ownership of chatOwnerships) {
      try {
        const chat = await v0.chats.getById({ chatId: ownership.v0_chat_id });
        chats.push(chat);
      } catch (error) {
        console.error(
          `Failed to fetch chat ${ownership.v0_chat_id}:`,
          error
        );
        // Continue with other chats even if one fails
      }
    }

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/textbook-studio/chats
 * Create a new v0 chat
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { message, projectId, system } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Handle authenticated users
    if (session?.user) {
      const userId = (session.user as any).id;

      // Check rate limit
      const limit = await checkChatLimit(parseInt(userId));
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: "Daily chat limit reached",
            count: limit.count,
            limit: limit.limit,
          },
          { status: 429 }
        );
      }

      // Create chat via v0 API
      const chatOptions: any = { message };
      if (projectId) chatOptions.projectId = projectId;
      if (system) chatOptions.system = system;

      const chat = await v0.chats.create(chatOptions);

      // Store ownership in database (cast chat to any to access id property)
      await query(
        `INSERT INTO chat_ownership (user_id, v0_chat_id, v0_project_id)
         VALUES ($1, $2, $3)`,
        [userId, (chat as any).id, projectId || null]
      );

      return NextResponse.json({
        success: true,
        chat,
      });
    }

    // Handle anonymous users
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ipAddress =
      forwardedFor?.split(",")[0].trim() || realIp || "unknown";

    // Check anonymous rate limit
    const limit = await checkAnonymousChatLimit(ipAddress);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Daily chat limit reached for anonymous users",
          count: limit.count,
          limit: limit.limit,
          message: "Please sign up or login to continue creating chats",
        },
        { status: 429 }
      );
    }

    // Create chat via v0 API
    const chatOptions: any = { message };
    if (projectId) chatOptions.projectId = projectId;
    if (system) chatOptions.system = system;

    const chat = await v0.chats.create(chatOptions);

    // Log anonymous chat (cast to any to access id)
    await logAnonymousChat(ipAddress, (chat as any).id);

    return NextResponse.json({
      success: true,
      chat,
      anonymous: true,
      remaining: limit.limit - limit.count - 1,
    });
  } catch (error: any) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create chat" },
      { status: 500 }
    );
  }
}
