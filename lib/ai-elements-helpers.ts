import type { ToolUIPart } from "ai";

export type MessagePart = Record<string, unknown>;

export type ChainOfThoughtStepData = {
  label: string;
  description?: string;
  status?: "complete" | "active" | "pending";
};

export type ChainOfThoughtData = {
  title?: string;
  steps: ChainOfThoughtStepData[];
  text?: string;
  searchResults: string[];
};

export type SourcePart = {
  url: string;
  title?: string;
  description?: string;
};

export function getPartText(part: MessagePart | undefined): string {
  if (!part) {
    return "";
  }

  const possibleKeys = ["text", "content", "body", "message", "response"];

  for (const key of possibleKeys) {
    const value = part[key];
    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}

export function parseChainOfThoughtPart(part: MessagePart): ChainOfThoughtData | null {
  if (!part || typeof part !== "object") {
    return null;
  }

  const title = typeof part.title === "string" ? part.title : undefined;
  const result: ChainOfThoughtData = {
    title,
    steps: [],
    text: undefined,
    searchResults: [],
  };

  const rawStepsSources = [
    Array.isArray(part.steps) ? (part.steps as unknown[]) : null,
    Array.isArray(part.content) ? (part.content as unknown[]) : null,
  ].filter(Boolean) as unknown[][];

  for (const rawSteps of rawStepsSources) {
    rawSteps.forEach((step, index) => {
      if (typeof step === "string") {
        result.steps.push({
          label: step,
          status: normalizeChainOfThoughtStatus(undefined, index),
        });
        return;
      }

      if (step && typeof step === "object") {
        const stepRecord = step as Record<string, unknown>;
        const label =
          typeof stepRecord.label === "string"
            ? stepRecord.label
            : typeof stepRecord.title === "string"
            ? stepRecord.title
            : `Step ${result.steps.length + 1}`;
        const description =
          typeof stepRecord.description === "string"
            ? stepRecord.description
            : typeof stepRecord.text === "string"
            ? stepRecord.text
            : undefined;
        const statusValue =
          typeof stepRecord.status === "string" ? stepRecord.status : undefined;

        result.steps.push({
          label,
          description,
          status: normalizeChainOfThoughtStatus(statusValue, index),
        });
      }
    });
  }

  if (result.steps.length === 0) {
    const textContent = getPartText(part);
    if (textContent) {
      const trimmed = textContent.trim();
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsed.forEach((item, index) => {
            if (typeof item === "string") {
              result.steps.push({
                label: item,
                status: normalizeChainOfThoughtStatus(undefined, index),
              });
            } else if (item && typeof item === "object") {
              const itemRecord = item as Record<string, unknown>;
              const label =
                typeof itemRecord.label === "string"
                  ? itemRecord.label
                  : typeof itemRecord.title === "string"
                  ? itemRecord.title
                  : `Step ${index + 1}`;
              const description =
                typeof itemRecord.description === "string"
                  ? itemRecord.description
                  : typeof itemRecord.text === "string"
                  ? itemRecord.text
                  : undefined;
              const status =
                typeof itemRecord.status === "string"
                  ? normalizeChainOfThoughtStatus(itemRecord.status, index)
                  : normalizeChainOfThoughtStatus(undefined, index);

              result.steps.push({
                label,
                description,
                status,
              });
            }
          });
        } else {
          result.text = textContent;
        }
      } catch {
        const lines = textContent.split("\n").map((line) => line.trim());
        const filteredLines = lines.filter((line) => line.length > 0);
        if (filteredLines.length > 1) {
          filteredLines.forEach((line, index) => {
            result.steps.push({
              label: line,
              status: normalizeChainOfThoughtStatus(undefined, index),
            });
          });
        } else {
          result.text = textContent;
        }
      }
    }
  }

  const searchCollections = [
    part.searchResults,
    (part as Record<string, unknown>)["search_results"],
    part.sources,
    part.references,
  ];

  for (const collection of searchCollections) {
    if (!Array.isArray(collection)) {
      continue;
    }

    collection.forEach((item) => {
      if (typeof item === "string") {
        result.searchResults.push(item);
        return;
      }

      if (item && typeof item === "object") {
        const itemRecord = item as Record<string, unknown>;
        const titleValue =
          typeof itemRecord.title === "string"
            ? itemRecord.title
            : typeof itemRecord.name === "string"
            ? itemRecord.name
            : typeof itemRecord.url === "string"
            ? itemRecord.url
            : undefined;
        if (titleValue) {
          result.searchResults.push(titleValue);
        }
      }
    });
  }

  if (
    result.steps.length === 0 &&
    !result.text &&
    result.searchResults.length === 0
  ) {
    return null;
  }

  result.steps = result.steps.map((step, index, steps) => ({
    ...step,
    status:
      step.status ??
      (steps.length === 1
        ? "active"
        : index === steps.length - 1
        ? "active"
        : "complete"),
  }));

  return result;
}

export function extractSourcesFromParts(parts: (MessagePart | undefined)[]): SourcePart[] {
  const sources: SourcePart[] = [];
  const seen = new Set<string>();

  parts.forEach((part) => {
    if (!part || typeof part !== "object") {
      return;
    }

    const partType = (part.type as string);
    if (partType !== "source-url" && partType !== "source") {
      return;
    }

    const url =
      typeof part.url === "string"
        ? part.url
        : typeof part.href === "string"
        ? part.href
        : undefined;

    if (!url || seen.has(url)) {
      return;
    }

    seen.add(url);

    const title =
      typeof part.title === "string"
        ? part.title
        : typeof part.name === "string"
        ? part.name
        : undefined;

    const description =
      typeof part.description === "string"
        ? part.description
        : typeof part.snippet === "string"
        ? part.snippet
        : undefined;

    sources.push({
      url,
      title,
      description,
    });
  });

  return sources;
}

export function mapToolState(state: string): ToolUIPart["state"] {
  switch (state) {
    case "input-streaming":
    case "input-available":
    case "output-available":
    case "output-error":
      return state;
    case "error":
      return "output-error";
    default:
      return "output-available";
  }
}

export function formatToolOutput(output: unknown): string | undefined {
  if (output === undefined || output === null) {
    return undefined;
  }

  if (typeof output === "string") {
    return output;
  }

  if (typeof output === "number" || typeof output === "boolean") {
    return String(output);
  }

  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return String(output);
  }
}

function normalizeChainOfThoughtStatus(
  status: string | undefined,
  index: number
): ChainOfThoughtStepData["status"] | undefined {
  if (!status) {
    return index === 0 ? "active" : undefined;
  }

  switch (status.toLowerCase()) {
    case "complete":
    case "completed":
      return "complete";
    case "active":
    case "current":
    case "in_progress":
      return "active";
    case "pending":
    case "upcoming":
    default:
      return undefined;
  }
}

