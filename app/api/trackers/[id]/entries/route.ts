import { NextResponse } from "next/server";
import { listEntries, addEntry } from "@/lib/health-graph";
import crypto from "crypto";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entries = await listEntries(id);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error listing entries:", error);
    return NextResponse.json({ error: "Failed to list entries" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const date = body?.date?.toString() || new Date().toISOString();
    const dataJson = (body?.dataJson ?? {}) as Record<string, unknown>;
    if (typeof dataJson !== "object" || Array.isArray(dataJson)) {
      return NextResponse.json({ error: "Invalid dataJson" }, { status: 400 });
    }
    const entryId = body?.entryId?.toString() || crypto.randomUUID();
    const entry = await addEntry({ trackerId: id, entryId, date, dataJson });
    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}


