import { tool as createTool } from "ai";
import { z } from "zod";

// Parallel AI client
const PARALLEL_API_URL = "https://api.parallel.com/v1";

function getApiKey(): string {
  const apiKey = process.env.PARALLEL_API_KEY;
  if (!apiKey) {
    throw new Error("PARALLEL_API_KEY environment variable is not set");
  }
  return apiKey;
}

export type ParallelTaskResult = {
  runId: string;
  status: string;
  output?: string;
  error?: string;
};

export type ParallelAgentOutput = {
  taskId: string;
  status: "created" | "processing" | "completed" | "failed";
  result?: ParallelTaskResult;
};

// Helper to poll for task completion
async function pollTaskCompletion(
  runId: string,
  maxAttempts = 30,
  delayMs = 2000
): Promise<ParallelTaskResult> {
  const apiKey = getApiKey();
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(
        `${PARALLEL_API_URL}/task-runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = (await response.json()) as any;

      if (data.status === "completed" || data.status === "failed") {
        return {
          runId,
          status: data.status,
          output: data.output,
          error: data.error,
        };
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error("Error polling task:", error);
    }
  }

  return {
    runId,
    status: "processing",
    error: "Task processing timeout",
  };
}

export const runParallelAgent = createTool({
  description:
    "Run a parallel AI agent to process complex tasks like research, analysis, and report generation using the Parallel AI platform.",
  inputSchema: z.object({
    input: z
      .string()
      .describe("The task or question for the parallel agent to process"),
    processor: z
      .enum(["mini", "standard", "ultra"])
      .default("standard")
      .describe("Processing power level (mini, standard, or ultra)"),
    timeout: z
      .number()
      .int()
      .min(1)
      .max(60)
      .default(30)
      .describe("Timeout in seconds to wait for task completion"),
  }),
  execute: async ({
    input,
    processor = "standard",
    timeout = 30,
  }): Promise<ParallelAgentOutput> => {
    try {
      const apiKey = getApiKey();
      // Create task
      const createResponse = await fetch(
        `${PARALLEL_API_URL}/task-runs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input,
            processor,
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error(
          `Failed to create task: ${createResponse.statusText}`
        );
      }

      const taskData = (await createResponse.json()) as any;
      const runId = taskData.run_id;

      // Poll for completion with the specified timeout
      const maxAttempts = Math.ceil(timeout / 2);
      const result = await pollTaskCompletion(runId, maxAttempts, 2000);

      return {
        taskId: runId,
        status:
          result.status === "completed"
            ? "completed"
            : result.status === "failed"
              ? "failed"
              : "processing",
        result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Parallel agent execution failed: ${errorMessage}`);
    }
  },
});

export const parallelTools = {
  runParallelAgent,
};
