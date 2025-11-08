import { NextResponse } from "next/server";

type ExtractResponse = {
  text: string;
  contentType: "text" | "pdf" | "image";
  meta?: Record<string, unknown>;
};

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
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing file" }, { status: 400 });
      }

      const filename = file.name?.toLowerCase() || "";
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
        const Tesseract = await import("tesseract.js");
        const { data } = await Tesseract.recognize(buffer, "eng", { logger: () => {} });
        const text = (data?.text || "").trim();
        const response: ExtractResponse = {
          text,
          contentType: "image",
          meta: { confidence: data?.confidence },
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


