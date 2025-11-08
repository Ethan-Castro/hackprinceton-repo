import { tool as createTool } from "ai";
import { z } from "zod";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@healthgateway.ai";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export type EmailResult = {
  success: boolean;
  messageId?: string;
  recipient?: string;
  message?: string;
  error?: string;
};

/**
 * Send appointment reminder email
 */
export const sendAppointmentReminder = createTool({
  description:
    "Send appointment reminder email to user. Includes appointment details and preparation instructions.",
  inputSchema: z.object({
    recipientEmail: z.string().email().describe("Email address to send reminder to"),
    appointmentTitle: z
      .string()
      .describe("Type of appointment (e.g., 'Annual Checkup')"),
    providerName: z.string().describe("Healthcare provider name or clinic"),
    appointmentDate: z
      .string()
      .describe("Appointment date (YYYY-MM-DD format)"),
    appointmentTime: z
      .string()
      .describe("Appointment time (HH:MM format)"),
    location: z
      .string()
      .describe("Appointment location or telehealth link"),
    preparationNotes: z
      .string()
      .optional()
      .describe("Any preparation needed (fasting, bringing documents, etc.)"),
    reminderType: z
      .enum(["same-day", "one-day-before", "one-week-before"])
      .optional()
      .describe("Type of reminder"),
  }),
  execute: async ({
    recipientEmail,
    appointmentTitle,
    providerName,
    appointmentDate,
    appointmentTime,
    location,
    preparationNotes,
    reminderType,
  }): Promise<EmailResult> => {
    try {
      if (!SENDGRID_API_KEY) {
        return {
          success: false,
          error: "SendGrid API key not configured. Set SENDGRID_API_KEY environment variable.",
        };
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #0066cc; color: white; padding: 20px; border-radius: 5px; }
              .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .appointment-details { background-color: white; padding: 15px; border-left: 4px solid #0066cc; margin: 10px 0; }
              .detail-item { margin: 8px 0; }
              .detail-label { font-weight: bold; color: #0066cc; }
              .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>📅 Appointment Reminder</h2>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>This is a reminder about your upcoming appointment:</p>

                <div class="appointment-details">
                  <div class="detail-item">
                    <span class="detail-label">Appointment Type:</span> ${appointmentTitle}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Provider:</span> ${providerName}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Date:</span> ${appointmentDate}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Time:</span> ${appointmentTime}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Location:</span> ${location}
                  </div>
                </div>

                ${
                  preparationNotes
                    ? `
                  <h3>Preparation Instructions</h3>
                  <p>${preparationNotes}</p>
                `
                    : ""
                }

                <p><strong>Important:</strong> Please arrive 10-15 minutes early if this is an in-person appointment.</p>
              </div>
              <div class="footer">
                <p>This is an automated message from Health Gateway.</p>
                <p>Do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const msg = {
        to: recipientEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: `Reminder: ${appointmentTitle} on ${appointmentDate}`,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers["x-message-id"] || "sent";

      return {
        success: true,
        messageId,
        recipient: recipientEmail,
        message: `Appointment reminder sent to ${recipientEmail}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to send appointment reminder: ${errorMessage}`,
      };
    }
  },
});

/**
 * Send medication reminder email
 */
export const sendMedicationReminder = createTool({
  description:
    "Send medication reminder email with dosage and timing information.",
  inputSchema: z.object({
    recipientEmail: z.string().email().describe("Email address to send reminder to"),
    medicationName: z.string().describe("Name of medication"),
    dosage: z.string().describe("Dosage amount (e.g., '500mg')"),
    frequency: z.string().describe("How often to take (e.g., 'Twice daily')"),
    instructions: z
      .string()
      .optional()
      .describe("Special instructions (e.g., 'Take with food')"),
    reminderTime: z
      .string()
      .optional()
      .describe("Time of day for reminder (HH:MM format)"),
  }),
  execute: async ({
    recipientEmail,
    medicationName,
    dosage,
    frequency,
    instructions,
    reminderTime,
  }): Promise<EmailResult> => {
    try {
      if (!SENDGRID_API_KEY) {
        return {
          success: false,
          error: "SendGrid API key not configured. Set SENDGRID_API_KEY environment variable.",
        };
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #16a34a; color: white; padding: 20px; border-radius: 5px; }
              .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .medication-details { background-color: white; padding: 15px; border-left: 4px solid #16a34a; margin: 10px 0; }
              .detail-item { margin: 8px 0; }
              .detail-label { font-weight: bold; color: #16a34a; }
              .alert { background-color: #fef3c7; padding: 10px; border-radius: 3px; margin: 10px 0; }
              .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>💊 Medication Reminder</h2>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>Time to take your medication:</p>

                <div class="medication-details">
                  <div class="detail-item">
                    <span class="detail-label">Medication:</span> ${medicationName}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Dosage:</span> ${dosage}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Frequency:</span> ${frequency}
                  </div>
                  ${
                    reminderTime
                      ? `
                    <div class="detail-item">
                      <span class="detail-label">Reminder Time:</span> ${reminderTime}
                    </div>
                  `
                      : ""
                  }
                </div>

                ${
                  instructions
                    ? `
                  <div class="alert">
                    <strong>Special Instructions:</strong><br/>
                    ${instructions}
                  </div>
                `
                    : ""
                }

                <p><strong>Tips for medication adherence:</strong></p>
                <ul>
                  <li>Take medication at the same time each day</li>
                  <li>Keep medications in original containers</li>
                  <li>Store in a safe, temperature-controlled place</li>
                  <li>Mark your calendar to track doses</li>
                </ul>
              </div>
              <div class="footer">
                <p>This is an automated message from Health Gateway.</p>
                <p>Do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const msg = {
        to: recipientEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: `Medication Reminder: ${medicationName} (${dosage})`,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers["x-message-id"] || "sent";

      return {
        success: true,
        messageId,
        recipient: recipientEmail,
        message: `Medication reminder sent to ${recipientEmail}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to send medication reminder: ${errorMessage}`,
      };
    }
  },
});

/**
 * Send lab result notification email
 */
export const sendLabResultNotification = createTool({
  description:
    "Send notification email when lab results become available with summary and next steps.",
  inputSchema: z.object({
    recipientEmail: z.string().email().describe("Email address to send to"),
    labName: z
      .string()
      .describe("Name of lab facility or test (e.g., 'Quest Diagnostics')"),
    testType: z
      .string()
      .describe("Type of lab test (e.g., 'Comprehensive Metabolic Panel')"),
    testDate: z
      .string()
      .describe("Date test was performed (YYYY-MM-DD format)"),
    resultsSummary: z
      .string()
      .describe("Summary of results (e.g., 'All results within normal range')"),
    actionRequired: z
      .string()
      .optional()
      .describe("Any required follow-up actions"),
    resultLink: z
      .string()
      .optional()
      .describe("Link to view full results"),
  }),
  execute: async ({
    recipientEmail,
    labName,
    testType,
    testDate,
    resultsSummary,
    actionRequired,
    resultLink,
  }): Promise<EmailResult> => {
    try {
      if (!SENDGRID_API_KEY) {
        return {
          success: false,
          error: "SendGrid API key not configured. Set SENDGRID_API_KEY environment variable.",
        };
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #7c3aed; color: white; padding: 20px; border-radius: 5px; }
              .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .results-box { background-color: white; padding: 15px; border-left: 4px solid #7c3aed; margin: 10px 0; }
              .detail-item { margin: 8px 0; }
              .detail-label { font-weight: bold; color: #7c3aed; }
              .cta-button { background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
              .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>🔬 Lab Results Available</h2>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>Your lab results are now available:</p>

                <div class="results-box">
                  <div class="detail-item">
                    <span class="detail-label">Lab Facility:</span> ${labName}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Test Type:</span> ${testType}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Test Date:</span> ${testDate}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Summary:</span> ${resultsSummary}
                  </div>
                </div>

                ${
                  actionRequired
                    ? `
                  <h3>Action Required</h3>
                  <p>${actionRequired}</p>
                `
                    : ""
                }

                ${
                  resultLink
                    ? `<a href="${resultLink}" class="cta-button">View Full Results</a>`
                    : ""
                }

                <p><strong>Note:</strong> Contact your healthcare provider if you have questions about your results.</p>
              </div>
              <div class="footer">
                <p>This is an automated message from Health Gateway.</p>
                <p>Do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const msg = {
        to: recipientEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: `Lab Results Available: ${testType}`,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers["x-message-id"] || "sent";

      return {
        success: true,
        messageId,
        recipient: recipientEmail,
        message: `Lab result notification sent to ${recipientEmail}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to send lab notification: ${errorMessage}`,
      };
    }
  },
});

/**
 * Send health summary email
 */
export const sendHealthSummary = createTool({
  description:
    "Send periodic health summary email with medications, appointments, and health metrics.",
  inputSchema: z.object({
    recipientEmail: z.string().email().describe("Email address to send to"),
    summaryPeriod: z
      .enum(["weekly", "monthly", "quarterly"])
      .describe("Period of summary"),
    activeMedications: z
      .number()
      .int()
      .describe("Number of active medications"),
    upcomingAppointments: z
      .number()
      .int()
      .describe("Number of upcoming appointments"),
    adherenceRate: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .describe("Medication adherence percentage"),
    healthMetrics: z
      .array(z.object({ metric: z.string(), value: z.string() }))
      .optional()
      .describe("Health metrics to include (e.g., blood pressure, weight)"),
    recommendations: z
      .array(z.string())
      .optional()
      .describe("Health recommendations"),
  }),
  execute: async ({
    recipientEmail,
    summaryPeriod,
    activeMedications,
    upcomingAppointments,
    adherenceRate,
    healthMetrics,
    recommendations,
  }): Promise<EmailResult> => {
    try {
      if (!SENDGRID_API_KEY) {
        return {
          success: false,
          error: "SendGrid API key not configured. Set SENDGRID_API_KEY environment variable.",
        };
      }

      const metricsHtml =
        healthMetrics && healthMetrics.length > 0
          ? `
        <h3>Health Metrics</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Metric</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Value</th>
          </tr>
          ${healthMetrics
            .map(
              (m) =>
                `<tr><td style="padding: 8px; border: 1px solid #ddd;">${m.metric}</td><td style="padding: 8px; border: 1px solid #ddd;">${m.value}</td></tr>`
            )
            .join("")}
        </table>
      `
          : "";

      const recommendationsHtml =
        recommendations && recommendations.length > 0
          ? `
        <h3>Recommendations</h3>
        <ul>
          ${recommendations.map((r) => `<li>${r}</li>`).join("")}
        </ul>
      `
          : "";

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #059669; color: white; padding: 20px; border-radius: 5px; }
              .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .stat-box { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #059669; }
              .stat-number { font-size: 24px; font-weight: bold; color: #059669; }
              .stat-label { color: #666; }
              .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>📊 ${summaryPeriod.charAt(0).toUpperCase() + summaryPeriod.slice(1)} Health Summary</h2>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>Here's your health summary for the past ${summaryPeriod}:</p>

                <div class="stat-box">
                  <div class="stat-number">${activeMedications}</div>
                  <div class="stat-label">Active Medications</div>
                </div>

                <div class="stat-box">
                  <div class="stat-number">${upcomingAppointments}</div>
                  <div class="stat-label">Upcoming Appointments</div>
                </div>

                ${
                  adherenceRate !== undefined
                    ? `
                <div class="stat-box">
                  <div class="stat-number">${adherenceRate}%</div>
                  <div class="stat-label">Medication Adherence Rate</div>
                </div>
                `
                    : ""
                }

                ${metricsHtml}
                ${recommendationsHtml}

                <p style="margin-top: 20px;"><strong>Stay healthy!</strong> Continue taking your medications as prescribed and attend your scheduled appointments.</p>
              </div>
              <div class="footer">
                <p>This is an automated message from Health Gateway.</p>
                <p>Do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const msg = {
        to: recipientEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: `Your ${summaryPeriod.charAt(0).toUpperCase() + summaryPeriod.slice(1)} Health Summary`,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers["x-message-id"] || "sent";

      return {
        success: true,
        messageId,
        recipient: recipientEmail,
        message: `Health summary sent to ${recipientEmail}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to send health summary: ${errorMessage}`,
      };
    }
  },
});

/**
 * Send medication refill alert
 */
export const sendMedicationRefillAlert = createTool({
  description:
    "Send alert when medication refills are running low.",
  inputSchema: z.object({
    recipientEmail: z.string().email().describe("Email address to send to"),
    medicationName: z.string().describe("Name of medication"),
    refillsRemaining: z
      .number()
      .int()
      .describe("Number of refills remaining"),
    daysSupplyRemaining: z
      .number()
      .int()
      .describe("Estimated days of medication supply remaining"),
    pharmacyName: z
      .string()
      .optional()
      .describe("Pharmacy name"),
    pharmacyPhone: z
      .string()
      .optional()
      .describe("Pharmacy contact number"),
  }),
  execute: async ({
    recipientEmail,
    medicationName,
    refillsRemaining,
    daysSupplyRemaining,
    pharmacyName,
    pharmacyPhone,
  }): Promise<EmailResult> => {
    try {
      if (!SENDGRID_API_KEY) {
        return {
          success: false,
          error: "SendGrid API key not configured. Set SENDGRID_API_KEY environment variable.",
        };
      }

      const urgency =
        daysSupplyRemaining <= 3 ? "URGENT" : "Please refill soon";
      const urgencyColor = daysSupplyRemaining <= 3 ? "#dc2626" : "#f97316";

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: ${urgencyColor}; color: white; padding: 20px; border-radius: 5px; }
              .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .alert-box { background-color: white; padding: 15px; border-left: 4px solid ${urgencyColor}; margin: 10px 0; }
              .detail-item { margin: 8px 0; }
              .detail-label { font-weight: bold; color: ${urgencyColor}; }
              .footer { color: #666; font-size: 12px; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>⚠️ Medication Refill Alert</h2>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p style="color: ${urgencyColor}; font-weight: bold;">${urgency}</p>

                <div class="alert-box">
                  <div class="detail-item">
                    <span class="detail-label">Medication:</span> ${medicationName}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Refills Remaining:</span> ${refillsRemaining}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Days Supply Remaining:</span> ${daysSupplyRemaining}
                  </div>
                  ${
                    pharmacyName
                      ? `
                    <div class="detail-item">
                      <span class="detail-label">Pharmacy:</span> ${pharmacyName}
                    </div>
                  `
                      : ""
                  }
                  ${
                    pharmacyPhone
                      ? `
                    <div class="detail-item">
                      <span class="detail-label">Contact:</span> ${pharmacyPhone}
                    </div>
                  `
                      : ""
                  }
                </div>

                <h3>Action Required</h3>
                <p>Please contact your pharmacy to refill this medication as soon as possible to avoid running out.</p>
                <p>If you have questions about your medication or refill, contact your healthcare provider.</p>
              </div>
              <div class="footer">
                <p>This is an automated message from Health Gateway.</p>
                <p>Do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const msg = {
        to: recipientEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: `Medication Refill Alert: ${medicationName}`,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers["x-message-id"] || "sent";

      return {
        success: true,
        messageId,
        recipient: recipientEmail,
        message: `Refill alert sent to ${recipientEmail}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: `Failed to send refill alert: ${errorMessage}`,
      };
    }
  },
});

export const sendgridTools = {
  sendAppointmentReminder,
  sendMedicationReminder,
  sendLabResultNotification,
  sendHealthSummary,
  sendMedicationRefillAlert,
};
