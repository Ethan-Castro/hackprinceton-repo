import { tool as createTool } from "ai";
import { z } from "zod";
import * as ElevenLabs from "elevenlabs";

// Initialize ElevenLabs
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

let client: ElevenLabs.ElevenLabsClient | null = null;
if (ELEVENLABS_API_KEY) {
  client = new ElevenLabs.ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });
}

export type VoiceReminderResult = {
  success: boolean;
  audioUrl?: string;
  message?: string;
  error?: string;
};

/**
 * Send appointment reminder via voice call
 */
export const sendVoiceAppointmentReminder = createTool({
  description:
    "Generate and send a voice reminder for an upcoming medical appointment using text-to-speech.",
  inputSchema: z.object({
    appointmentTitle: z
      .string()
      .describe("Type of appointment (e.g., 'Annual Checkup')"),
    providerName: z.string().describe("Healthcare provider name"),
    appointmentDate: z
      .string()
      .describe("Appointment date (YYYY-MM-DD format)"),
    appointmentTime: z
      .string()
      .describe("Appointment time (HH:MM format)"),
    voiceId: z
      .string()
      .default("21m00Tcm4TlvDq8ikWAM")
      .describe("ElevenLabs voice ID for the reminder (default: Rachel)"),
  }),
  execute: async ({
    appointmentTitle,
    providerName,
    appointmentDate,
    appointmentTime,
    voiceId,
  }): Promise<VoiceReminderResult> => {
    try {
      if (!ELEVENLABS_API_KEY || !client) {
        return {
          success: false,
          error: "ElevenLabs API key not configured. Set ELEVENLABS_API_KEY environment variable.",
        };
      }

      const reminderText = `
        Good morning. This is a reminder about your upcoming appointment.
        You have a ${appointmentTitle} scheduled with ${providerName}
        on ${appointmentDate} at ${appointmentTime}.
        Please arrive 10-15 minutes early.
        If you need to cancel or reschedule, please contact the office as soon as possible.
        Thank you.
      `;

      // Generate speech
      const audioStream = await client.textToSpeech.convert(voiceId, {
        text: reminderText.trim(),
        output_format: "mp3_44100_128",
      });

      // Convert stream to base64 or save URL
      const chunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const audioBuffer = Buffer.concat(chunks);
      const audioBase64 = audioBuffer.toString("base64");
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      return {
        success: true,
        audioUrl,
        message: `Voice reminder generated for ${appointmentTitle} on ${appointmentDate} at ${appointmentTime}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to generate voice reminder: ${errorMessage}`,
      };
    }
  },
});

/**
 * Send medication reminder via voice call
 */
export const sendVoiceMedicationReminder = createTool({
  description:
    "Generate a voice reminder for taking medication using text-to-speech.",
  inputSchema: z.object({
    medicationName: z.string().describe("Name of medication"),
    dosage: z.string().describe("Dosage amount (e.g., '500mg')"),
    frequency: z.string().describe("How often to take (e.g., 'twice daily')"),
    instructions: z
      .string()
      .optional()
      .describe("Special instructions (e.g., 'take with food')"),
    voiceId: z
      .string()
      .default("21m00Tcm4TlvDq8ikWAM")
      .describe("ElevenLabs voice ID (default: Rachel)"),
  }),
  execute: async ({
    medicationName,
    dosage,
    frequency,
    instructions,
    voiceId,
  }): Promise<VoiceReminderResult> => {
    try {
      if (!ELEVENLABS_API_KEY || !client) {
        return {
          success: false,
          error: "ElevenLabs API key not configured. Set ELEVENLABS_API_KEY environment variable.",
        };
      }

      let reminderText = `
        Time to take your medication.
        Medication: ${medicationName}
        Dosage: ${dosage}
        Frequency: ${frequency}
      `;

      if (instructions) {
        reminderText += `\nSpecial instructions: ${instructions}`;
      }

      reminderText += `
        Please take your medication as directed.
        If you have any questions or concerns, contact your healthcare provider.
      `;

      // Generate speech
      const audioStream = await client.textToSpeech.convert(voiceId, {
        text: reminderText.trim(),
        output_format: "mp3_44100_128",
      });

      // Convert stream to base64
      const chunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const audioBuffer = Buffer.concat(chunks);
      const audioBase64 = audioBuffer.toString("base64");
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      return {
        success: true,
        audioUrl,
        message: `Voice reminder generated for ${medicationName} (${dosage})`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to generate voice reminder: ${errorMessage}`,
      };
    }
  },
});

/**
 * Send health alert via voice
 */
export const sendVoiceHealthAlert = createTool({
  description:
    "Generate an urgent health alert message as voice using text-to-speech.",
  inputSchema: z.object({
    alertType: z
      .enum(["lab-result", "medication-alert", "appointment-urgent", "health-check"])
      .describe("Type of health alert"),
    message: z.string().describe("Alert message content"),
    urgency: z
      .enum(["low", "medium", "high"])
      .default("medium")
      .describe("Urgency level of the alert"),
    voiceId: z
      .string()
      .default("21m00Tcm4TlvDq8ikWAM")
      .describe("ElevenLabs voice ID (default: Rachel)"),
  }),
  execute: async ({
    alertType,
    message,
    urgency,
    voiceId,
  }): Promise<VoiceReminderResult> => {
    try {
      if (!ELEVENLABS_API_KEY || !client) {
        return {
          success: false,
          error: "ElevenLabs API key not configured. Set ELEVENLABS_API_KEY environment variable.",
        };
      }

      const urgencyPrefix =
        urgency === "high"
          ? "URGENT HEALTH ALERT. "
          : urgency === "medium"
            ? "IMPORTANT HEALTH NOTIFICATION. "
            : "";

      let alertText = `${urgencyPrefix}${message}`;

      if (alertType === "lab-result") {
        alertText += "\nPlease check your health portal or contact your healthcare provider for details.";
      } else if (alertType === "medication-alert") {
        alertText +=
          "\nPlease follow up with your healthcare provider or pharmacist immediately.";
      } else if (alertType === "appointment-urgent") {
        alertText += "\nPlease contact your healthcare provider as soon as possible.";
      }

      // Generate speech
      const audioStream = await client.textToSpeech.convert(voiceId, {
        text: alertText.trim(),
        output_format: "mp3_44100_128",
      });

      // Convert stream to base64
      const chunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const audioBuffer = Buffer.concat(chunks);
      const audioBase64 = audioBuffer.toString("base64");
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      return {
        success: true,
        audioUrl,
        message: `Voice alert generated for ${alertType} (${urgency} urgency)`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to generate voice alert: ${errorMessage}`,
      };
    }
  },
});

/**
 * Generate voice reminder for health metrics check
 */
export const sendVoiceHealthMetricReminder = createTool({
  description:
    "Generate a voice reminder to check health metrics (blood pressure, weight, glucose, etc.)",
  inputSchema: z.object({
    metricType: z
      .enum(["blood-pressure", "blood-glucose", "weight", "temperature", "oxygen", "heart-rate"])
      .describe("Type of health metric to check"),
    frequency: z
      .string()
      .describe("How often to check (e.g., 'daily', 'twice daily', 'weekly')"),
    targetRange: z
      .string()
      .optional()
      .describe("Target range for the metric (e.g., '120/80 for blood pressure')"),
    voiceId: z
      .string()
      .default("21m00Tcm4TlvDq8ikWAM")
      .describe("ElevenLabs voice ID (default: Rachel)"),
  }),
  execute: async ({
    metricType,
    frequency,
    targetRange,
    voiceId,
  }): Promise<VoiceReminderResult> => {
    try {
      if (!ELEVENLABS_API_KEY || !client) {
        return {
          success: false,
          error: "ElevenLabs API key not configured. Set ELEVENLABS_API_KEY environment variable.",
        };
      }

      const metricNames: Record<string, string> = {
        "blood-pressure": "blood pressure",
        "blood-glucose": "blood glucose",
        weight: "weight",
        temperature: "temperature",
        oxygen: "oxygen level",
        "heart-rate": "heart rate",
      };

      const metricName = metricNames[metricType];
      let reminderText = `
        Reminder to check your ${metricName}.
        You should check this ${frequency}.
      `;

      if (targetRange) {
        reminderText += `\nTarget range: ${targetRange}`;
      }

      reminderText += `
        Record your reading and contact your healthcare provider if you have any concerns.
      `;

      // Generate speech
      const audioStream = await client.textToSpeech.convert(voiceId, {
        text: reminderText.trim(),
        output_format: "mp3_44100_128",
      });

      // Convert stream to base64
      const chunks: Uint8Array[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const audioBuffer = Buffer.concat(chunks);
      const audioBase64 = audioBuffer.toString("base64");
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      return {
        success: true,
        audioUrl,
        message: `Voice reminder generated for ${metricName} check (${frequency})`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to generate voice reminder: ${errorMessage}`,
      };
    }
  },
});

export const elevenlabsTools = {
  sendVoiceAppointmentReminder,
  sendVoiceMedicationReminder,
  sendVoiceHealthAlert,
  sendVoiceHealthMetricReminder,
};
