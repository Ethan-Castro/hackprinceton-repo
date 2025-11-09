import { NextRequest, NextResponse } from "next/server";
import * as ElevenLabs from "elevenlabs";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

let client: ElevenLabs.ElevenLabsClient | null = null;
if (ELEVENLABS_API_KEY) {
  client = new ElevenLabs.ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!ELEVENLABS_API_KEY || !client) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb", modelId = "eleven_turbo_v2_5" } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Generate speech with streaming
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      model_id: modelId,
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        use_speaker_boost: true,
      },
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);

    // Return audio as response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate speech" },
      { status: 500 }
    );
  }
}

