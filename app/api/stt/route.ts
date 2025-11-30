import { NextRequest, NextResponse } from "next/server";
import * as ElevenLabs from "elevenlabs";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

let client: ElevenLabs.ElevenLabsClient | null = null;
if (ELEVENLABS_API_KEY) {
  client = new ElevenLabs.ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });
}

interface WebFormData {
  get(name: string): FormDataEntryValue | null;
}

export async function POST(req: NextRequest) {
  try {
    if (!ELEVENLABS_API_KEY || !client) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const formData = (await req.formData()) as unknown as WebFormData;
    const audioEntry = formData.get("audio");
    if (!audioEntry || typeof audioEntry === "string") {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }
    const audioFile = audioEntry as Blob & { type: string };

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([arrayBuffer], { type: audioFile.type });

    // Transcribe audio
    const transcription = await client.speechToText.convert({
      file: audioBlob,
      model_id: "scribe_v1",
      tag_audio_events: false,
      diarize: false, // Not needed for single speaker
    });

    return NextResponse.json({
      text: transcription.text,
      language: transcription.language_code,
    });
  } catch (error) {
    console.error("STT error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
