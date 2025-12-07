import { NextResponse } from "next/server";
import { generateText } from "ai";
import { gateway } from "@/lib/gateway";

type ExtractResponse = {
  text: string;
  contentType: "text" | "pdf" | "image";
  meta?: Record<string, unknown>;
};

interface WebFormData {
  get(name: string): FormDataEntryValue | null;
}

const VISION_MODEL_ID = "google/gemini-2.5-flash";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const text = (body?.text ?? "").toString();
      if (!text.trim()) {
        return NextResponse.json({ error: "Missing 'text' in body" }, { status: 400 });
      }
      const response: ExtractResponse = { text, contentType: "text" };
      return NextResponse.json(response);
    }

    if (contentType.includes("multipart/form-data")) {
      const form = (await req.formData()) as unknown as WebFormData;
      const fileEntry = form.get("file");
      if (!fileEntry || typeof fileEntry === "string") {
        return NextResponse.json({ error: "Missing file" }, { status: 400 });
      }
      const file = fileEntry as Blob & { name?: string; type: string };

      const filename = (file.name ?? "").toLowerCase();
      const isPdf = filename.endsWith(".pdf") || file.type === "application/pdf";
      const isImage =
        file.type.startsWith("image/") ||
        /\.(png|jpg|jpeg|webp)$/i.test(filename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isPdf) {
        // Lazy import to avoid requiring dep at build time if not installed yet
        const pdfParse = (await import("pdf-parse")).default;
        const result = await pdfParse(buffer);
        const text = (result.text || "").trim();
        const response: ExtractResponse = {
          text,
          contentType: "pdf",
          meta: { numPages: result.numpages },
        };
        return NextResponse.json(response);
      }

      if (isImage) {
        // Prefer vision model extraction when available
        if (process.env.AI_GATEWAY_API_KEY) {
          try {
            const { text } = await generateText({
              model: gateway(VISION_MODEL_ID),
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Extract every readable word exactly as shown; do not paraphrase. Capture headings, body copy, labels, form fields, table cells, and small print. Describe layout and styling with precision.

OUTPUT FORMAT:
1) Plain Text: verbatim transcription in reading order (top-left to bottom-right). Preserve section breaks with blank lines when spacing implies separation.
2) Layout Map: numbered sections/cards/panels with their relative position (top/center/bottom, left/center/right), approximate sizing (full-width/half/third), and nesting (e.g., "Section 2 contains table + CTA row").
3) Style & Visuals: for each section, list colors (background/text/accent/CTA) with approximate hex-like values when visible; gradients; borders; corner radius; shadows; dividers; spacing (padding/margins/gaps). Include typography cues (serif vs sans, weight, size hierarchy like h1/h2/body/small).
4) Key Elements: bullets of CTAs, inputs, form fields, tables, charts, icons/logos/images with: label/text, location, style (color, border, radius), and any values shown.
5) Data Capture: for tables/lists/charts, enumerate headers and row/label-value pairs; include axis labels and units if present.

If unsure about a detail, say "unclear" rather than guessing.`,
                    },
                    { type: "image", image: buffer },
                  ],
                },
              ],
              maxOutputTokens: 2048,
            });

            const visionText = (text || "").trim();
            if (visionText) {
              const response: ExtractResponse = {
                text: visionText,
                contentType: "image",
                meta: { model: VISION_MODEL_ID, extractedWith: "vision" },
              };
              return NextResponse.json(response);
            }
          } catch (visionError) {
            console.error("Vision extraction failed, falling back to Tesseract:", visionError);
          }
        }

        // Fallback to local OCR if vision path unavailable or failed
        const Tesseract = await import("tesseract.js");
        const { data } = await Tesseract.recognize(buffer, "eng", { logger: () => {} });
        const text = (data?.text || "").trim();
        const response: ExtractResponse = {
          text,
          contentType: "image",
          meta: { confidence: data?.confidence, extractedWith: "tesseract" },
        };
        return NextResponse.json(response);
      }

      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unsupported content-type" }, { status: 415 });
  } catch (error) {
    console.error("Error extracting report text:", error);
    return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
  }
}
