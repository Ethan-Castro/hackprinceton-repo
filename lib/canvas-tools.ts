import { tool as createTool } from "ai";
import { z } from "zod";

export type DiagramType =
  | "flowchart"
  | "sequence"
  | "erdiagram"
  | "mindmap"
  | "classDiagram"
  | "stateDiagram"
  | "gantt"
  | "pie";

export type CanvasToolOutput = {
  title: string;
  description?: string;
  diagramType: DiagramType;
  mermaidCode: string;
  success: boolean;
};

export const generateDiagram = createTool({
  description:
    "Generate visual diagrams using Mermaid syntax (flowcharts, sequence diagrams, entity-relationship diagrams, mind maps, class diagrams, state diagrams, Gantt charts, pie charts). Diagrams are rendered as SVG.",
  inputSchema: z.object({
    title: z.string().describe("Title of the diagram"),
    description: z
      .string()
      .optional()
      .describe("Brief description of what the diagram shows"),
    diagramType: z
      .enum([
        "flowchart",
        "sequence",
        "erdiagram",
        "mindmap",
        "classDiagram",
        "stateDiagram",
        "gantt",
        "pie",
      ])
      .describe("Type of diagram to generate"),
    content: z
      .string()
      .describe(
        "The Mermaid diagram definition. Use proper Mermaid syntax for the selected diagram type."
      ),
  }),
  execute: async ({
    title,
    description,
    diagramType,
    content,
  }): Promise<CanvasToolOutput> => {
    try {
      // Validate Mermaid syntax is present
      if (!content || content.trim().length === 0) {
        return {
          title,
          description,
          diagramType,
          mermaidCode: "",
          success: false,
        };
      }

      // Normalize content (mindmap inputs sometimes include their own "mindmap" header)
      let normalizedContent = content;
      if (diagramType === "mindmap") {
        const leadingMindmapLine = /^\s*mindmap[^\n]*\n?/i;
        normalizedContent = normalizedContent.replace(leadingMindmapLine, "");
        normalizedContent = normalizedContent.replace(/^\s*\n/, "");
        if (/^\S/.test(normalizedContent)) {
          normalizedContent = `  ${normalizedContent}`;
        }
      } else {
        normalizedContent = normalizedContent.trim();
      }

      if (normalizedContent.trim().length === 0) {
        return {
          title,
          description,
          diagramType,
          mermaidCode: "",
          success: false,
        };
      }

      // Build Mermaid code with diagram configuration
      let mermaidCode = "";

      // Add diagram title based on type
      const diagramHeader: Record<DiagramType, string> = {
        flowchart: "flowchart TD",
        sequence: "sequenceDiagram",
        erdiagram: "erDiagram",
        mindmap: "mindmap",
        classDiagram: "classDiagram",
        stateDiagram: "stateDiagram-v2",
        gantt: "gantt",
        pie: 'pie title "' + title + '"',
      };

      // For pie charts, include title in the diagram type
      if (diagramType === "pie") {
        mermaidCode = `pie title "${title}"\n${normalizedContent}`;
      } else {
        mermaidCode = `${diagramHeader[diagramType]}\n${normalizedContent}`;
      }

      // Add title as comment for non-pie diagrams
      if (diagramType !== "pie") {
        mermaidCode = `%% ${title}\n${mermaidCode}`;
      }

      return {
        title,
        description,
        diagramType,
        mermaidCode,
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        title,
        description,
        diagramType,
        mermaidCode: "",
        success: false,
      };
    }
  },
});

export const generateFlowchart = createTool({
  description:
    "Generate a flowchart diagram showing process flows, decision trees, or algorithms",
  inputSchema: z.object({
    title: z.string().describe("Title of the flowchart"),
    nodes: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          shape: z
            .enum(["rect", "diamond", "circle", "square"])
            .default("rect"),
        })
      )
      .describe("Nodes in the flowchart"),
    edges: z
      .array(
        z.object({
          from: z.string(),
          to: z.string(),
          label: z.string().optional(),
        })
      )
      .describe("Connections between nodes"),
  }),
  execute: async ({
    title,
    nodes,
    edges,
  }): Promise<CanvasToolOutput> => {
    try {
      const shapeMap: Record<string, string> = {
        rect: "[{}]",
        diamond: "{<>}",
        circle: "(())",
        square: "[[]]",
      };

      let content = "";

      // Add nodes
      for (const node of nodes) {
        const shape = shapeMap[node.shape] || "[{}]";
        const [open, close] = shape.split("<>");
        content += `    ${node.id}${open}"${node.label}"${close}\n`;
      }

      // Add edges
      for (const edge of edges) {
        const label = edge.label ? `"|${edge.label}|"` : "";
        content += `    ${edge.from} -->|${label}| ${edge.to}\n`;
      }

      return {
        title,
        diagramType: "flowchart",
        mermaidCode: `flowchart TD\n${content}`,
        success: true,
      };
    } catch (error) {
      return {
        title,
        diagramType: "flowchart",
        mermaidCode: "",
        success: false,
      };
    }
  },
});

export const generateERDiagram = createTool({
  description:
    "Generate an Entity-Relationship diagram showing database schema and relationships",
  inputSchema: z.object({
    title: z.string().describe("Title of the ER diagram"),
    entities: z
      .array(
        z.object({
          name: z.string(),
          attributes: z.array(z.string()),
        })
      )
      .describe("Database entities/tables with their attributes"),
    relationships: z
      .array(
        z.object({
          from: z.string(),
          to: z.string(),
          cardinality: z.enum(["||", "o|", "|o", "oo"]).default("||"),
          label: z.string().optional(),
        })
      )
      .describe("Relationships between entities"),
  }),
  execute: async ({
    title,
    entities,
    relationships,
  }): Promise<CanvasToolOutput> => {
    try {
      let content = "";

      // Add entities
      for (const entity of entities) {
        content += `    ${entity.name} {\n`;
        for (const attr of entity.attributes) {
          content += `        ${attr}\n`;
        }
        content += `    }\n`;
      }

      // Add relationships
      for (const rel of relationships) {
        const label = rel.label ? ` : ${rel.label}` : "";
        content += `    ${rel.from} ${rel.cardinality}--${rel.cardinality} ${rel.to}${label}\n`;
      }

      return {
        title,
        diagramType: "erdiagram",
        mermaidCode: `erDiagram\n${content}`,
        success: true,
      };
    } catch (error) {
      return {
        title,
        diagramType: "erdiagram",
        mermaidCode: "",
        success: false,
      };
    }
  },
});

export const canvasTools = {
  generateMermaidDiagram: generateDiagram,
  generateMermaidFlowchart: generateFlowchart,
  generateMermaidERDiagram: generateERDiagram,
};
