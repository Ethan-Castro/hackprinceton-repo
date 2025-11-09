import { NextRequest, NextResponse } from "next/server";
import { v0, ChatDetail } from "v0-sdk";

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, projectId } = await request.json();

    console.log("[v0-chat] Request received:", { message: message?.substring(0, 50), chatId, projectId });

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if V0_API_KEY is set
    if (!process.env.V0_API_KEY) {
      console.error("[v0-chat] V0_API_KEY not configured");
      return NextResponse.json(
        { 
          error: "V0_API_KEY not configured",
          details: "Please add your v0 API key to .env.local. Get one from https://v0.dev/chat/settings/keys"
        },
        { status: 500 }
      );
    }

    console.log("[v0-chat] Calling v0 SDK...");

    let chat;

    if (chatId) {
      // Continue existing chat
      console.log("[v0-chat] Continuing chat:", chatId);
      chat = await v0.chats.sendMessage({
        chatId: chatId,
        message,
      });
    } else {
      // Create new chat with sync mode (important!)
      console.log("[v0-chat] Creating new chat with sync mode");
      const chatOptions: any = {
        message: message,
        responseMode: 'sync', // Explicitly use sync mode for immediate response
        modelConfiguration: {
          modelId: 'v0-1.5-md', // Use the medium model
        },
      };

      // Add projectId if provided
      if (projectId) {
        chatOptions.projectId = projectId;
      }

      chat = await v0.chats.create(chatOptions);
    }

    // Type guard to ensure we have a ChatDetail and not a stream
    if (chat instanceof ReadableStream) {
      console.error("[v0-chat] Unexpected streaming response");
      throw new Error('Unexpected streaming response - responseMode should be sync');
    }

    const chatDetail = chat as ChatDetail;

    console.log("[v0-chat] Success! Chat ID:", chatDetail.id, "Demo URL:", chatDetail.demo);
    console.log("[v0-chat] Files count:", chatDetail.files?.length || 0);
    console.log("[v0-chat] Messages count:", chatDetail.messages?.length || 0);

    return NextResponse.json({
      id: chatDetail.id,
      demo: chatDetail.demo,
      files: chatDetail.files || [],
      messages: chatDetail.messages?.map((msg) => ({
        ...msg,
        experimental_content: (msg as any).experimental_content,
      })) || [],
    });
  } catch (error: any) {
    console.error("[v0-chat] Error:", error);
    console.error("[v0-chat] Error details:", {
      message: error.message,
      stack: error.stack,
      status: error.status,
      statusText: error.statusText,
    });
    return NextResponse.json(
      { 
        error: "Failed to process request",
        details: error.message || "Unknown error",
        hint: "Check server logs for more details"
      },
      { status: 500 }
    );
  }
}
