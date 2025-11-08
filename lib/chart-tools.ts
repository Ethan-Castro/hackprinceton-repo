import { tool as createTool } from "ai";
import { z } from "zod";

// Chart configuration schema
const ChartConfigSchema = z.record(z.string(),
  z.object({
    label: z.string(),
    color: z.string().optional(),
  })
);

// Chart configuration types
export type ChartData = Record<string, string | number>[];
export type ChartConfig = Record<string, { label: string; color?: string }>;

export type ChartToolOutput = {
  title: string;
  description?: string;
  chartType: "area" | "line" | "bar" | "pie" | "scatter";
  data: ChartData;
  config: ChartConfig;
  xAxisKey?: string;
  yAxisKeys?: string[];
  width?: number;
  height?: number;
};

export const generateChart = createTool({
  description:
    "Generate an interactive chart visualization with customizable data and styling. Supports area, line, bar, pie, and scatter charts.",
  inputSchema: z.object({
    title: z.string().describe("The title of the chart"),
    description: z.string().optional().describe("A brief description of the chart"),
    chartType: z
      .enum(["area", "line", "bar", "pie", "scatter"])
      .describe("The type of chart to generate"),
    data: z
      .array(z.record(z.string(), z.union([z.string(), z.number()])))
      .describe("Array of data points for the chart"),
    config: ChartConfigSchema.describe(
      "Configuration for chart series with labels and colors"
    ),
    xAxisKey: z
      .string()
      .optional()
      .describe("The key to use for the X-axis (for non-pie charts)"),
    yAxisKeys: z
      .array(z.string())
      .optional()
      .describe("Array of keys to display as Y-axis series"),
    width: z.number().optional().describe("Width of the chart in pixels"),
    height: z.number().optional().describe("Height of the chart in pixels"),
  }),
  execute: async (input): Promise<ChartToolOutput> => {
    // Validate that we have data
    if (!input.data || input.data.length === 0) {
      throw new Error("Chart data cannot be empty");
    }

    // Validate that config keys exist in data
    const sampleDataPoint = input.data[0];
    const configKeys = Object.keys(input.config);
    const dataKeys = Object.keys(sampleDataPoint);

    for (const key of configKeys) {
      if (!dataKeys.includes(key)) {
        console.warn(`Warning: Config key "${key}" not found in data`);
      }
    }

    return {
      title: input.title,
      description: input.description,
      chartType: input.chartType,
      data: input.data as ChartData,
      config: input.config as ChartConfig,
      xAxisKey: input.xAxisKey,
      yAxisKeys: input.yAxisKeys,
      width: input.width || 600,
      height: input.height || 400,
    };
  },
});

export const chartTools = {
  generateChart,
};
