import { tool as createTool } from "ai";
import { z } from "zod";

export type DashboardToolOutput = {
  code: string;
  title: string;
  description: string;
  type: "react-dashboard";
  structuredData?: string;
};

/**
 * Tool for generating interactive React dashboards from data
 * This tool calls the /api/generate-dashboard endpoint and returns
 * code that can be rendered with SandpackDashboardRenderer
 */
export const generateReactDashboard = createTool({
  description: `Generate an interactive React dashboard component using Sandpack. Use this when the user wants to:
- Visualize data from a PDF, report, or dataset
- Create interactive charts and graphs
- Build business intelligence dashboards
- Transform raw data into visual insights

The dashboard will be rendered live in the browser with interactive controls (filters, toggles, sliders).
Uses Recharts for charts and Lucide icons. All code runs in a secure Sandpack environment.`,
  inputSchema: z.object({
    text: z
      .string()
      .describe(
        "The raw text or structured data to visualize. Can be messy PDF text or clean JSON."
      ),
    goal: z
      .string()
      .describe(
        "The user's goal for the dashboard (e.g., 'Show revenue trends over time', 'Compare product performance', 'Visualize quarterly growth')"
      )
      .optional(),
    title: z
      .string()
      .describe("Title for the dashboard (e.g., 'Revenue Dashboard', 'Sales Analytics')")
      .optional(),
    description: z
      .string()
      .describe("Description of what the dashboard shows")
      .optional(),
    modelId: z
      .string()
      .describe("Model ID to use for generation (optional, defaults to claude-sonnet-4.5)")
      .optional(),
  }),
  execute: async function ({
    text,
    goal,
    title,
    description,
    modelId,
  }): Promise<DashboardToolOutput> {
    try {
      // Determine base URL - use localhost in development, or construct from env
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      // Call the generate-dashboard API
      const response = await fetch(`${baseUrl}/api/generate-dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          goal: goal || "Create an interactive dashboard visualizing this data",
          modelId: modelId || "anthropic/claude-sonnet-4.5",
          skipDataCleaning: text.trim().startsWith("{") || text.trim().startsWith("["),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to generate dashboard: ${response.statusText}`
        );
      }

      // Read the stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let code = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        code += decoder.decode(value, { stream: true });
      }

      // Final decode
      code += decoder.decode();

      return {
        code: code.trim(),
        title: title || "Generated Dashboard",
        description:
          description || "Interactive dashboard generated from your data",
        type: "react-dashboard",
      };
    } catch (error) {
      console.error("[generateReactDashboard] Error:", error);
      throw error;
    }
  },
});

/**
 * Tool for refining an existing dashboard based on user feedback
 */
export const refineDashboard = createTool({
  description: `Refine or modify an existing React dashboard based on user feedback. Use this when the user wants to:
- Change chart types (e.g., "make it a bar chart")
- Add or remove filters
- Change colors or styling
- Add new metrics or visualizations
- Modify the layout

Requires the current dashboard code and the user's modification request.`,
  inputSchema: z.object({
    currentCode: z
      .string()
      .describe("The current React dashboard code to modify"),
    request: z
      .string()
      .describe(
        "The user's modification request (e.g., 'Make this a bar chart instead', 'Add a date filter', 'Change the color scheme to blue')"
      ),
    modelId: z
      .string()
      .describe("Model ID to use for generation (optional)")
      .optional(),
  }),
  execute: async function ({
    currentCode,
    request,
    modelId,
  }): Promise<DashboardToolOutput> {
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const response = await fetch(`${baseUrl}/api/generate-dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: request,
          currentCode,
          isRefinement: true,
          modelId: modelId || "anthropic/claude-sonnet-4.5",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to refine dashboard: ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let code = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        code += decoder.decode(value, { stream: true });
      }

      code += decoder.decode();

      return {
        code: code.trim(),
        title: "Refined Dashboard",
        description: `Dashboard modified: ${request}`,
        type: "react-dashboard",
      };
    } catch (error) {
      console.error("[refineDashboard] Error:", error);
      throw error;
    }
  },
});

/**
 * All dashboard-related tools
 */
export const dashboardTools = {
  generateReactDashboard,
  refineDashboard,
};

