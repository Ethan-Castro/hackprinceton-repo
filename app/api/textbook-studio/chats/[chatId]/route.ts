/**
 * V0 Chat Detail API Routes
 * Get chat details and send messages to a specific chat
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { queryOne } from "@/lib/neon";
import { v0 } from "v0-sdk";

/**
 * GET /api/textbook-studio/chats/[chatId]
 * Get details for a specific chat
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { chatId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if user owns this chat
    const ownership = await queryOne<{ v0_chat_id: string }>(
      `SELECT v0_chat_id FROM chat_ownership
       WHERE user_id = $1 AND v0_chat_id = $2`,
      [userId, chatId]
    );

    if (!ownership) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch chat from v0 API
    const chat = await v0.chats.getById({ chatId });

    return NextResponse.json({ chat });
  } catch (error: any) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/textbook-studio/chats/[chatId]
 * Send a message to a specific chat
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { chatId } = await params;
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if user owns this chat
    const ownership = await queryOne<{ v0_chat_id: string }>(
      `SELECT v0_chat_id FROM chat_ownership
       WHERE user_id = $1 AND v0_chat_id = $2`,
      [userId, chatId]
    );

    if (!ownership) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    // Send message via v0 API
    const response = await v0.chats.sendMessage({
      chatId: chatId,
      message,
    });

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
