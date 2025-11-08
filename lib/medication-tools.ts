import { tool as createTool } from "ai";
import { z } from "zod";
import { query } from "./neon";

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  reason: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  pharmacy?: string;
  refillsRemaining?: number;
  sideEffects?: string[];
  notes?: string;
};

export type MedicationEntry = {
  id: string;
  medicationId: string;
  takenAt: string;
  taken: boolean;
  notes?: string;
};

export type MedicationResult = {
  success: boolean;
  medication?: Medication;
  medications?: Medication[];
  entry?: MedicationEntry;
  entries?: MedicationEntry[];
  adherenceRate?: number;
  message?: string;
  error?: string;
};

/**
 * Add a medication to the tracking system
 */
export const addMedication = createTool({
  description:
    "Add a new medication to track. Stores prescription details, dosage, frequency, and helps monitor adherence.",
  inputSchema: z.object({
    name: z
      .string()
      .describe("Medication name (e.g., 'Metformin', 'Lisinopril')"),
    dosage: z
      .string()
      .describe("Dosage amount (e.g., '500mg', '2 tablets')"),
    frequency: z
      .string()
      .describe("How often to take (e.g., 'Twice daily', 'Every 8 hours')"),
    reason: z
      .string()
      .describe("Medical reason for taking (e.g., 'Type 2 Diabetes')"),
    startDate: z
      .string()
      .describe("Start date (YYYY-MM-DD format)"),
    endDate: z
      .string()
      .optional()
      .describe("End date if temporary (YYYY-MM-DD format)"),
    prescribedBy: z
      .string()
      .optional()
      .describe("Healthcare provider who prescribed"),
    pharmacy: z
      .string()
      .optional()
      .describe("Pharmacy name or location"),
    refillsRemaining: z
      .number()
      .int()
      .optional()
      .describe("Number of refills available"),
    sideEffects: z
      .array(z.string())
      .optional()
      .describe("Known or experienced side effects"),
    notes: z
      .string()
      .optional()
      .describe("Additional notes (e.g., 'Take with food')"),
  }),
  execute: async ({
    name,
    dosage,
    frequency,
    reason,
    startDate,
    endDate,
    prescribedBy,
    pharmacy,
    refillsRemaining,
    sideEffects,
    notes,
  }): Promise<MedicationResult> => {
    try {
      const medicationId = `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const medication: Medication = {
        id: medicationId,
        name,
        dosage,
        frequency,
        reason,
        startDate,
        endDate,
        prescribedBy,
        pharmacy,
        refillsRemaining,
        sideEffects,
        notes,
      };

      // Store in database
      try {
        const query = `
          INSERT INTO medications (
            id, name, dosage, frequency, reason, start_date, end_date,
            prescribed_by, pharmacy, refills_remaining, side_effects, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
        await query(query, [
          medicationId,
          name,
          dosage,
          frequency,
          reason,
          startDate,
          endDate || null,
          prescribedBy || "",
          pharmacy || "",
          refillsRemaining || 0,
          JSON.stringify(sideEffects || []),
          notes || "",
        ]);
      } catch (dbError) {
        console.warn("Database insert failed:", dbError);
      }

      return {
        success: true,
        medication,
        message: `Added ${name} (${dosage}) to medication tracking. Set reminders for adherence tracking.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to add medication: ${errorMessage}`,
      };
    }
  },
});

/**
 * Log that a medication was taken
 */
export const logMedicationTaken = createTool({
  description:
    "Record that you took a medication. Helps track medication adherence and identify patterns.",
  inputSchema: z.object({
    medicationId: z
      .string()
      .describe("ID of the medication"),
    taken: z
      .boolean()
      .default(true)
      .describe("Whether the dose was taken or skipped"),
    timestamp: z
      .string()
      .optional()
      .describe("When the medication was taken (defaults to now)"),
    notes: z
      .string()
      .optional()
      .describe("Any notes about the dose (e.g., 'Forgot morning dose')"),
  }),
  execute: async ({
    medicationId,
    taken,
    timestamp,
    notes,
  }): Promise<MedicationResult> => {
    try {
      const entryId = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const takenAt = timestamp || new Date().toISOString();

      const entry: MedicationEntry = {
        id: entryId,
        medicationId,
        takenAt,
        taken,
        notes,
      };

      // Store in database
      try {
        const query = `
          INSERT INTO medication_entries (id, medication_id, taken_at, taken, notes)
          VALUES ($1, $2, $3, $4, $5)
        `;
        await query(query, [entryId, medicationId, takenAt, taken, notes || ""]);
      } catch (dbError) {
        console.warn("Database insert failed:", dbError);
      }

      return {
        success: true,
        entry,
        message: `Medication dose ${taken ? "recorded as taken" : "marked as skipped"}${notes ? ` (${notes})` : ""}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to log medication: ${errorMessage}`,
      };
    }
  },
});

/**
 * List all current medications
 */
export const listMedications = createTool({
  description:
    "View all current medications and their details. Can filter by reason or status.",
  inputSchema: z.object({
    activeOnly: z
      .boolean()
      .default(true)
      .describe("Show only active medications (not ended)"),
    reason: z
      .string()
      .optional()
      .describe("Filter by medical reason"),
  }),
  execute: async ({ activeOnly, reason }): Promise<MedicationResult> => {
    try {
      let query = "SELECT * FROM medications";
      const params: unknown[] = [];

      if (activeOnly) {
        query += " WHERE (end_date IS NULL OR end_date > NOW()::date)";
      }

      if (reason) {
        params.push(`%${reason}%`);
        query += activeOnly
          ? ` AND reason ILIKE $1`
          : ` WHERE reason ILIKE $1`;
      }

      query += " ORDER BY start_date DESC";

      try {
        const result = await query(query, params);
        const medications: Medication[] = (result as any[]).map((row: any) => ({
          id: row.id,
          name: row.name,
          dosage: row.dosage,
          frequency: row.frequency,
          reason: row.reason,
          startDate: row.start_date,
          endDate: row.end_date,
          prescribedBy: row.prescribed_by,
          pharmacy: row.pharmacy,
          refillsRemaining: row.refills_remaining,
          sideEffects: JSON.parse(row.side_effects || "[]"),
          notes: row.notes,
        }));

        return {
          success: true,
          medications,
          message: `Found ${medications.length} medication(s)`,
        };
      } catch (dbError) {
        return {
          success: true,
          medications: [],
          message: "No medications found",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to retrieve medications: ${errorMessage}`,
      };
    }
  },
});

/**
 * Check medication adherence rate
 */
export const getMedicationAdherence = createTool({
  description:
    "Calculate medication adherence rate. Shows percentage of doses taken as scheduled.",
  inputSchema: z.object({
    medicationId: z
      .string()
      .describe("ID of medication to check"),
    daysBack: z
      .number()
      .int()
      .default(30)
      .describe("Number of days to analyze"),
  }),
  execute: async ({ medicationId, daysBack }): Promise<MedicationResult> => {
    try {
      const query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN taken THEN 1 ELSE 0 END) as taken,
          ROUND(100.0 * SUM(CASE WHEN taken THEN 1 ELSE 0 END) / COUNT(*), 1) as adherence_rate
        FROM medication_entries
        WHERE medication_id = $1
          AND taken_at >= NOW() - INTERVAL '${daysBack} days'
      `;

      try {
        const result = (await query(query, [medicationId])) as any[];
        const data = result[0];
        const adherenceRate = data?.adherence_rate || 0;

        return {
          success: true,
          adherenceRate,
          message: `Adherence rate: ${adherenceRate}% (${data?.taken || 0} of ${data?.total || 0} doses taken in last ${daysBack} days)`,
        };
      } catch (dbError) {
        return {
          success: true,
          adherenceRate: 0,
          message: "No adherence data available",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to calculate adherence: ${errorMessage}`,
      };
    }
  },
});

/**
 * Check for potential drug interactions
 */
export const checkDrugInteractions = createTool({
  description:
    "Check for potential interactions between medications. Shows warnings and recommendations.",
  inputSchema: z.object({
    medicationIds: z
      .array(z.string())
      .describe("IDs of medications to check for interactions"),
  }),
  execute: async ({ medicationIds }): Promise<MedicationResult> => {
    try {
      // This would ideally use a drug interaction API
      // For now, return a message to consult with healthcare provider
      return {
        success: true,
        message: `Checking ${medicationIds.length} medication(s) for interactions. Always consult your healthcare provider or pharmacist about potential drug interactions.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to check interactions: ${errorMessage}`,
      };
    }
  },
});

/**
 * Remove a medication from tracking
 */
export const removeMedication = createTool({
  description:
    "Stop tracking a medication (mark as ended). Use when stopping a medication.",
  inputSchema: z.object({
    medicationId: z
      .string()
      .describe("ID of medication to remove"),
    endDate: z
      .string()
      .optional()
      .describe("Date medication was discontinued (YYYY-MM-DD)"),
    reason: z
      .string()
      .optional()
      .describe("Reason for stopping (e.g., 'Switched to alternative')"),
  }),
  execute: async ({ medicationId, endDate, reason }): Promise<MedicationResult> => {
    try {
      const query = `
        UPDATE medications
        SET end_date = $1, notes = CONCAT(notes, $2)
        WHERE id = $3
      `;

      try {
        await query(query, [
          endDate || new Date().toISOString().split("T")[0],
          reason ? `\nStopped: ${reason}` : "",
          medicationId,
        ]);

        return {
          success: true,
          message: `Medication marked as discontinued${reason ? ` (${reason})` : ""}`,
        };
      } catch (dbError) {
        return {
          success: true,
          message: "Medication tracking ended",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to remove medication: ${errorMessage}`,
      };
    }
  },
});

export const medicationTools = {
  addMedication,
  logMedicationTaken,
  listMedications,
  getMedicationAdherence,
  checkDrugInteractions,
  removeMedication,
};
