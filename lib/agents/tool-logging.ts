import type { GenerateTextOnStepFinishCallback } from "ai";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createToolLogger<TOOLS extends Record<string, any>>(namespace: string): GenerateTextOnStepFinishCallback<TOOLS> {
  return ({ toolCalls, toolResults }) => {
    if (toolCalls && toolCalls.length > 0) {
      console.log(`[${namespace}] Tool calls:`, toolCalls.map((tc) => ({
        name: tc.toolName,
        input: "input" in tc ? tc.input : undefined,
      })));
    }

    if (toolResults && toolResults.length > 0) {
      console.log(`[${namespace}] Tool results:`, toolResults.map((tr) => ({
        tool: tr.toolName,
        success: "result" in tr,
      })));
    }
  };
}
