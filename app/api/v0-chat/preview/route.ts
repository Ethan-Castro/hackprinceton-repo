import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const data = req.nextUrl.searchParams.get("data");

  if (!data && !id) {
    return NextResponse.json({ error: "data or id is required" }, { status: 400 });
  }

  try {
    if (data) {
      const html = Buffer.from(data, "base64url").toString("utf8");
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  } catch (error: any) {
    console.error("[v0-chat] Preview load error:", error);
    return NextResponse.json(
      { error: "Failed to load preview" },
      { status: 500 }
    );
  }
}
