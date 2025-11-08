import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { listTrackers, upsertTracker, type TrackerSchemaField } from "@/lib/health-graph";

async function getOrSetDeviceIdCookie(): Promise<string> {
  const jar = await cookies();
  let deviceId = jar.get("deviceId")?.value;
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    jar.set("deviceId", deviceId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return deviceId;
}

export async function GET() {
  try {
    const deviceId = await getOrSetDeviceIdCookie();
    const trackers = await listTrackers(deviceId);
    return NextResponse.json({ trackers });
  } catch (error) {
    console.error("Error listing trackers:", error);
    return NextResponse.json({ error: "Failed to list trackers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const deviceId = await getOrSetDeviceIdCookie();
    const body = await req.json();
    const name = (body?.name ?? "").toString();
    const schemaJson = (body?.schemaJson ?? []) as TrackerSchemaField[];
    if (!name.trim() || !Array.isArray(schemaJson) || schemaJson.length === 0) {
      return NextResponse.json({ error: "Invalid tracker payload" }, { status: 400 });
    }
    const trackerId = body?.trackerId?.toString() || crypto.randomUUID();
    const tracker = await upsertTracker({ deviceId, trackerId, name, schemaJson });
    return NextResponse.json({ tracker });
  } catch (error) {
    console.error("Error creating tracker:", error);
    return NextResponse.json({ error: "Failed to create tracker" }, { status: 500 });
  }
}


