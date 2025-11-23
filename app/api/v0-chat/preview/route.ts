import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const PREVIEW_DIR = path.join(process.cwd(), ".next", "cache", "cerebras-previews");

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const filePath = path.join(PREVIEW_DIR, `${id}.html`);
    const html = await fs.readFile(filePath, "utf8");

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return NextResponse.json({ error: "Preview not found" }, { status: 404 });
    }

    console.error("[v0-chat] Preview load error:", error);
    return NextResponse.json(
      { error: "Failed to load preview" },
      { status: 500 }
    );
  }
}
