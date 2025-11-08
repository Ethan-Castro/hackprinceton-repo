import { withSession } from "./neo4j";

export type TrackerSchemaField = {
  id: string;
  name: string;
  type: "number" | "text" | "enum" | "boolean";
  options?: string[];
};

export type Tracker = {
  trackerId: string;
  name: string;
  schemaJson: TrackerSchemaField[];
  createdAt: string;
};

export type Entry = {
  entryId: string;
  date: string; // ISO
  dataJson: Record<string, unknown>;
};

export async function upsertUser(deviceId: string): Promise<void> {
  await withSession(async (s) => {
    await s.run(
      `
      MERGE (u:User { deviceId: $deviceId })
      ON CREATE SET u.createdAt = datetime()
      RETURN u
      `,
      { deviceId }
    );
  }, "WRITE");
}

export async function upsertTracker(params: {
  deviceId: string;
  trackerId: string;
  name: string;
  schemaJson: TrackerSchemaField[];
}): Promise<Tracker> {
  const { deviceId, trackerId, name, schemaJson } = params;
  const createdAt = new Date().toISOString();
  const result = await withSession(async (s) => {
    const res = await s.run(
      `
      MERGE (u:User { deviceId: $deviceId })
      ON CREATE SET u.createdAt = datetime()
      MERGE (t:Tracker { trackerId: $trackerId })
      ON CREATE SET t.createdAt = datetime()
      SET t.name = $name, t.schemaJson = $schemaJson
      MERGE (u)-[:OWNS]->(t)
      RETURN t { .trackerId, .name, .schemaJson, createdAt: toString(t.createdAt) } AS tracker
      `,
      { deviceId, trackerId, name, schemaJson }
    );
    const record = res.records[0];
    return record?.get("tracker") as Tracker;
  }, "WRITE");
  return result ?? { trackerId, name, schemaJson, createdAt };
}

export async function listTrackers(deviceId: string): Promise<Tracker[]> {
  const result = await withSession(async (s) => {
    const res = await s.run(
      `
      MATCH (u:User { deviceId: $deviceId })-[:OWNS]->(t:Tracker)
      RETURN t { .trackerId, .name, .schemaJson, createdAt: toString(t.createdAt) } AS tracker
      ORDER BY t.createdAt DESC
      `,
      { deviceId }
    );
    return res.records.map((r) => r.get("tracker") as Tracker);
  }, "READ");
  return result;
}

export async function addEntry(params: {
  trackerId: string;
  entryId: string;
  date: string;
  dataJson: Record<string, unknown>;
}): Promise<Entry> {
  const { trackerId, entryId, date, dataJson } = params;
  const result = await withSession(async (s) => {
    const res = await s.run(
      `
      MATCH (t:Tracker { trackerId: $trackerId })
      MERGE (e:Entry { entryId: $entryId })
      SET e.date = datetime($date), e.dataJson = $dataJson
      MERGE (t)-[:HAS_ENTRY]->(e)
      RETURN e { .entryId, date: toString(e.date), .dataJson } AS entry
      `,
      { trackerId, entryId, date, dataJson }
    );
    const record = res.records[0];
    return record?.get("entry") as Entry;
  }, "WRITE");
  return result ?? { entryId, date, dataJson };
}

export async function listEntries(trackerId: string): Promise<Entry[]> {
  const result = await withSession(async (s) => {
    const res = await s.run(
      `
      MATCH (:Tracker { trackerId: $trackerId })-[:HAS_ENTRY]->(e:Entry)
      RETURN e { .entryId, date: toString(e.date), .dataJson } AS entry
      ORDER BY e.date DESC
      `,
      { trackerId }
    );
    return res.records.map((r) => r.get("entry") as Entry);
  }, "READ");
  return result;
}

export async function upsertReport(params: {
  deviceId: string;
  reportId: string;
  title: string;
  text: string;
}): Promise<{ reportId: string }> {
  const { deviceId, reportId, title, text } = params;
  await withSession(async (s) => {
    await s.run(
      `
      MERGE (u:User { deviceId: $deviceId })
      ON CREATE SET u.createdAt = datetime()
      MERGE (r:Report { reportId: $reportId })
      ON CREATE SET r.createdAt = datetime()
      SET r.title = $title, r.text = $text
      MERGE (u)-[:OWNS]->(r)
      `,
      { deviceId, reportId, title, text }
    );
  }, "WRITE");
  return { reportId };
}

export async function linkFindings(params: {
  reportId: string;
  findings: Array<{ findingId: string; label: string; value?: string; unit?: string }>;
}): Promise<void> {
  const { reportId, findings } = params;
  await withSession(async (s) => {
    const tx = s.beginTransaction();
    try {
      for (const f of findings) {
        await tx.run(
          `
          MATCH (r:Report { reportId: $reportId })
          MERGE (f:Finding { findingId: $findingId })
          SET f.label = $label, f.value = $value, f.unit = $unit
          MERGE (r)-[:HAS_FINDING]->(f)
          `,
          { reportId, findingId: f.findingId, label: f.label, value: f.value ?? null, unit: f.unit ?? null }
        );
      }
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }, "WRITE");
}

export async function addSource(params: { url: string; title?: string; fetchedAt?: string }): Promise<void> {
  const { url, title, fetchedAt } = params;
  await withSession(async (s) => {
    await s.run(
      `
      MERGE (s:Source { url: $url })
      ON CREATE SET s.createdAt = datetime()
      SET s.title = coalesce($title, s.title), s.fetchedAt = coalesce(datetime($fetchedAt), s.fetchedAt)
      `,
      { url, title: title ?? null, fetchedAt: fetchedAt ?? null }
    );
  }, "WRITE");
}


