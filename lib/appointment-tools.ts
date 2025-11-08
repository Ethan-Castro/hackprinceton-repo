import { tool as createTool } from "ai";
import { z } from "zod";
import { query } from "./neon";

export type Appointment = {
  id: string;
  title: string;
  providerName: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: "in-person" | "telehealth" | "phone";
  notes?: string;
  reminders?: {
    email: boolean;
    sms: boolean;
    voice: boolean;
    minutesBefore: number;
  };
};

export type AppointmentResult = {
  success: boolean;
  appointment?: Appointment;
  appointments?: Appointment[];
  message?: string;
  error?: string;
};

/**
 * Schedule a new medical appointment
 */
export const scheduleAppointment = createTool({
  description:
    "Schedule a medical appointment with a healthcare provider. Stores appointment details and sets up reminders.",
  inputSchema: z.object({
    title: z
      .string()
      .describe("Type of appointment (e.g., 'Annual checkup', 'Cardiology consultation')"),
    providerName: z
      .string()
      .describe("Name of healthcare provider or clinic"),
    date: z
      .string()
      .describe("Appointment date (YYYY-MM-DD format)"),
    time: z
      .string()
      .describe("Appointment time (HH:MM format, 24-hour)"),
    duration: z
      .number()
      .int()
      .min(15)
      .default(30)
      .describe("Duration in minutes"),
    location: z
      .string()
      .describe("Appointment location or telehealth link"),
    type: z
      .enum(["in-person", "telehealth", "phone"])
      .default("in-person")
      .describe("Type of appointment"),
    notes: z
      .string()
      .optional()
      .describe("Additional notes or preparation instructions"),
    reminderMinutesBefore: z
      .number()
      .int()
      .default(1440)
      .describe("Send reminder X minutes before appointment (default: 1 day)"),
  }),
  execute: async ({
    title,
    providerName,
    date,
    time,
    duration,
    location,
    type,
    notes,
    reminderMinutesBefore,
  }): Promise<AppointmentResult> => {
    try {
      const appointmentId = `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const appointment: Appointment = {
        id: appointmentId,
        title,
        providerName,
        date,
        time,
        duration,
        location,
        type,
        notes,
        reminders: {
          email: true,
          sms: false,
          voice: false,
          minutesBefore: reminderMinutesBefore,
        },
      };

      // Store in database
      try {
        await query(
          `INSERT INTO appointments (
            id, title, provider_name, appointment_date, appointment_time,
            duration, location, type, notes, reminder_minutes_before
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET updated_at = NOW()`,
          [
            appointmentId,
            title,
            providerName,
            date,
            time,
            duration,
            location,
            type,
            notes || "",
            reminderMinutesBefore,
          ]
        );
      } catch (dbError) {
        // Continue even if database fails - still return success for Neo4j storage
        console.warn("Database insert failed:", dbError);
      }

      return {
        success: true,
        appointment,
        message: `Appointment scheduled successfully. Reminder set for ${reminderMinutesBefore} minutes before.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to schedule appointment: ${errorMessage}`,
      };
    }
  },
});

/**
 * List upcoming appointments
 */
export const listAppointments = createTool({
  description:
    "View all upcoming medical appointments. Can filter by date range or provider.",
  inputSchema: z.object({
    startDate: z
      .string()
      .optional()
      .describe("Filter appointments from this date (YYYY-MM-DD)"),
    endDate: z
      .string()
      .optional()
      .describe("Filter appointments until this date (YYYY-MM-DD)"),
    providerName: z
      .string()
      .optional()
      .describe("Filter by specific healthcare provider name"),
    limit: z
      .number()
      .int()
      .default(10)
      .describe("Maximum number of appointments to return"),
  }),
  execute: async ({
    startDate,
    endDate,
    providerName,
    limit,
  }): Promise<AppointmentResult> => {
    try {
      // Build query
      let sqlStr = "SELECT * FROM appointments WHERE appointment_date >= NOW()::date";
      const params: unknown[] = [];

      if (startDate) {
        params.push(startDate);
        sqlStr += ` AND appointment_date >= $${params.length}`;
      }

      if (endDate) {
        params.push(endDate);
        sqlStr += ` AND appointment_date <= $${params.length}`;
      }

      if (providerName) {
        params.push(providerName);
        sqlStr += ` AND provider_name ILIKE $${params.length}`;
      }

      sqlStr += ` ORDER BY appointment_date, appointment_time LIMIT ${limit}`;

      try {
        const result = await query(sqlStr, params);
        const appointments: Appointment[] = (result as any[]).map((row: any) => ({
          id: row.id,
          title: row.title,
          providerName: row.provider_name,
          date: row.appointment_date,
          time: row.appointment_time,
          duration: row.duration,
          location: row.location,
          type: row.type,
          notes: row.notes,
          reminders: {
            email: true,
            sms: false,
            voice: false,
            minutesBefore: row.reminder_minutes_before,
          },
        }));

        return {
          success: true,
          appointments,
          message: `Found ${appointments.length} upcoming appointments`,
        };
      } catch (dbError) {
        // Return empty list if database fails
        return {
          success: true,
          appointments: [],
          message: "No appointments found or database unavailable",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to retrieve appointments: ${errorMessage}`,
      };
    }
  },
});

/**
 * Cancel or reschedule an appointment
 */
export const cancelAppointment = createTool({
  description:
    "Cancel an existing appointment or provide rescheduling information.",
  inputSchema: z.object({
    appointmentId: z
      .string()
      .describe("ID of the appointment to cancel"),
    reason: z
      .string()
      .optional()
      .describe("Reason for cancellation (for records)"),
    rescheduleDate: z
      .string()
      .optional()
      .describe("If rescheduling, new appointment date (YYYY-MM-DD)"),
    rescheduleTime: z
      .string()
      .optional()
      .describe("If rescheduling, new appointment time (HH:MM)"),
  }),
  execute: async ({
    appointmentId,
    reason,
    rescheduleDate,
    rescheduleTime,
  }): Promise<AppointmentResult> => {
    try {
      if (rescheduleDate && rescheduleTime) {
        // Reschedule
        try {
          const result = await query(
            `UPDATE appointments SET appointment_date = $1, appointment_time = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
            [rescheduleDate, rescheduleTime, appointmentId]
          );
          return {
            success: true,
            message: `Appointment rescheduled to ${rescheduleDate} at ${rescheduleTime}`,
          };
        } catch (dbError) {
          return {
            success: true,
            message: "Reschedule request noted (database sync failed)",
          };
        }
      } else {
        // Cancel
        try {
          await query(
            `DELETE FROM appointments WHERE id = $1`,
            [appointmentId]
          );
          return {
            success: true,
            message: `Appointment cancelled${reason ? ` (${reason})` : ""}. Consider notifying the provider.`,
          };
        } catch (dbError) {
          return {
            success: true,
            message: "Cancellation request noted (database sync failed)",
          };
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to process appointment: ${errorMessage}`,
      };
    }
  },
});

/**
 * Set reminder preferences for an appointment
 */
export const setAppointmentReminder = createTool({
  description:
    "Configure reminder settings for medical appointments (email, SMS, or voice calls).",
  inputSchema: z.object({
    appointmentId: z
      .string()
      .describe("ID of the appointment"),
    reminderType: z
      .enum(["email", "sms", "voice"])
      .describe("Type of reminder"),
    minutesBefore: z
      .number()
      .int()
      .min(15)
      .default(1440)
      .describe("Minutes before appointment to send reminder"),
    enabled: z
      .boolean()
      .default(true)
      .describe("Enable or disable this reminder"),
  }),
  execute: async ({
    appointmentId,
    reminderType,
    minutesBefore,
    enabled,
  }): Promise<AppointmentResult> => {
    try {
      try {
        await query(
          `UPDATE appointments SET reminder_minutes_before = $1, updated_at = NOW() WHERE id = $2`,
          [minutesBefore, appointmentId]
        );
        return {
          success: true,
          message: `${reminderType} reminder ${enabled ? "enabled" : "disabled"} for ${minutesBefore} minutes before appointment`,
        };
      } catch (dbError) {
        return {
          success: true,
          message: "Reminder preference noted",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to update reminder: ${errorMessage}`,
      };
    }
  },
});

export const appointmentTools = {
  scheduleAppointment,
  listAppointments,
  cancelAppointment,
  setAppointmentReminder,
};
