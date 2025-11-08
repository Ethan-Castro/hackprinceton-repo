import { tool as createTool } from "ai";
import { z } from "zod";
import { addEntry, upsertReport } from "./health-graph";
import crypto from "crypto";

export const browseUrl = createTool({
  description: "Fetch a web page and return its readable text content for analysis and summarization.",
  inputSchema: z.object({
    url: z.string().url().describe("HTTP/HTTPS URL to fetch"),
  }),
  execute: async ({ url }) => {
    const u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol)) {
      throw new Error("Only HTTP/HTTPS are allowed");
    }
    const res = await fetch(url, { headers: { "User-Agent": "HealthCoach/1.0 (+AI)" } });
    const contentType = res.headers.get("content-type") || "";
    let text = "";
    if (contentType.includes("text/html")) {
      const html = await res.text();
      // naive HTML to text strip
      text = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
      text = text.replace(/\s+/g, " ").trim();
    } else {
      text = await res.text();
    }
    return { url, text: text.slice(0, 20000) };
  },
});

export const saveTrackerEntry = createTool({
  description: "Persist a tracker entry to the database for the given trackerId.",
  inputSchema: z.object({
    trackerId: z.string().min(1),
    date: z.string().datetime().optional(),
    data: z.record(z.string(), z.any()),
  }),
  execute: async ({ trackerId, date, data }) => {
    const entry = await addEntry({
      trackerId,
      entryId: crypto.randomUUID(),
      date: date ?? new Date().toISOString(),
      dataJson: data,
    });
    return entry;
  },
});

export const indexReport = createTool({
  description: "Store a medical report text for later reference and linking to findings.",
  inputSchema: z.object({
    deviceId: z.string().optional(),
    reportId: z.string().default(() => crypto.randomUUID()),
    title: z.string().default("Medical Report"),
    text: z.string().min(1),
  }),
  execute: async ({ deviceId, reportId, title, text }) => {
    const effectiveDeviceId = deviceId ?? "anonymous";
    await upsertReport({ deviceId: effectiveDeviceId, reportId, title, text });
    return { reportId, title, stored: true };
  },
});

export const healthTools = {
  browseUrl,
  saveTrackerEntry,
  indexReport,
};


