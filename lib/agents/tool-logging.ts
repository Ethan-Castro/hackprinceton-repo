import type { GenerateTextOnStepFinishCallback } from "ai";

export function createToolLogger(namespace: string): GenerateTextOnStepFinishCallback {
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
