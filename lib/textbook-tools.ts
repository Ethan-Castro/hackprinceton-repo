import { tool as createTool } from 'ai';
import { z } from 'zod';

/**
 * Tool for generating a textbook chapter
 * Creates structured educational content with sections and subsections
 */
export const generateTextbookChapter = createTool({
  description:
    'Generate a complete textbook chapter with title, introduction, multiple sections with content, and a conclusion. Use this for creating comprehensive educational content on a specific topic.',
  inputSchema: z.object({
    title: z
      .string()
      .describe('The chapter title'),
    introduction: z
      .string()
      .describe('Opening paragraph introducing the chapter topic and learning objectives'),
    sections: z
      .array(
        z.object({
          heading: z.string().describe('Section heading'),
          content: z.string().describe('Section content in markdown format'),
          subsections: z
            .array(
              z.object({
                subheading: z.string(),
                content: z.string(),
              })
            )
            .optional()
            .describe('Optional subsections within this section'),
        })
      )
      .describe('Array of sections that make up the chapter'),
    conclusion: z
      .string()
      .describe('Concluding paragraph summarizing key points')
      .optional(),
  }),
  execute: async function ({ title, introduction, sections, conclusion }) {
    try {
      if (!title || !introduction || !sections || sections.length === 0) {
        throw new Error("Chapter must have a title, introduction, and at least one section");
      }

      return {
        title,
        introduction,
        sections,
        conclusion,
      };
    } catch (error) {
      console.error("Error in generateTextbookChapter:", error);
      throw error;
    }
  },
});

/**
 * Tool for generating practice exercises
 * Creates questions, problems, or activities for learners
 */
export const generateExercises = createTool({
  description:
    'Generate practice exercises, quiz questions, or discussion prompts. Use this to create interactive learning activities that test understanding of concepts.',
  inputSchema: z.object({
    title: z
      .string()
      .describe('Title for the exercise set')
      .optional(),
    exercises: z
      .array(
        z.object({
          question: z.string().describe('The question or prompt'),
          type: z
            .enum(['multiple-choice', 'short-answer', 'true-false', 'coding', 'discussion'])
            .describe('Type of exercise'),
          options: z
            .array(z.string())
            .optional()
            .describe('Answer options for multiple-choice questions'),
          correctAnswer: z
            .string()
            .optional()
            .describe('The correct answer (for practice mode)'),
          explanation: z
            .string()
            .optional()
            .describe('Explanation of the answer or concept'),
          difficulty: z
            .enum(['easy', 'medium', 'hard'])
            .optional()
            .describe('Difficulty level'),
        })
      )
      .describe('Array of exercises'),
  }),
  execute: async function ({ title, exercises }) {
    try {
      if (!exercises || exercises.length === 0) {
        throw new Error("Must provide at least one exercise");
      }

      return {
        title: title || 'Practice Exercises',
        exercises,
      };
    } catch (error) {
      console.error("Error in generateExercises:", error);
      throw error;
    }
  },
});

/**
 * Tool for generating visual diagrams
 * Creates SVG or HTML-based visualizations
 */
export const generateDiagram = createTool({
  description:
    'Generate a visual diagram or illustration using HTML/SVG. Use this to create flowcharts, concept maps, timelines, architecture diagrams, or any visual representation of concepts.',
  inputSchema: z.object({
    title: z
      .string()
      .describe('Title of the diagram'),
    description: z
      .string()
      .describe('Description of what the diagram illustrates')
      .optional(),
    html: z
      .string()
      .describe('Complete HTML/SVG code for the diagram with inline CSS styling'),
    type: z
      .enum(['flowchart', 'concept-map', 'timeline', 'architecture', 'process', 'comparison', 'other'])
      .describe('Type of diagram'),
  }),
  execute: async function ({ title, description, html, type }) {
    try {
      if (!html || html.trim().length === 0) {
        throw new Error("Diagram HTML cannot be empty");
      }

      const encodedHtml = encodeURIComponent(html);
      const dataUrl = `data:text/html;charset=utf-8,${encodedHtml}`;

      return {
        title,
        description,
        html,
        dataUrl,
        type,
      };
    } catch (error) {
      console.error("Error in generateDiagram:", error);
      throw error;
    }
  },
});

/**
 * Tool for generating code examples
 * Creates annotated code with explanations
 */
export const generateCodeExample = createTool({
  description:
    'Generate an interactive code example with explanation. Use this to demonstrate programming concepts, algorithms, or provide working code samples.',
  inputSchema: z.object({
    title: z
      .string()
      .describe('Title of the code example'),
    description: z
      .string()
      .describe('Brief description of what the code does'),
    code: z
      .string()
      .describe('The actual code'),
    language: z
      .string()
      .describe('Programming language (e.g., javascript, python, typescript)'),
    explanation: z
      .string()
      .describe('Detailed explanation of how the code works'),
    runnable: z
      .boolean()
      .optional()
      .describe('Whether this code can be executed in the browser'),
    output: z
      .string()
      .optional()
      .describe('Expected output when code is run'),
  }),
  execute: async function ({ title, description, code, language, explanation, runnable, output }) {
    try {
      if (!code || code.trim().length === 0) {
        throw new Error("Code cannot be empty");
      }

      return {
        title,
        description,
        code,
        language,
        explanation,
        runnable: runnable || false,
        output,
      };
    } catch (error) {
      console.error("Error in generateCodeExample:", error);
      throw error;
    }
  },
});

/**
 * Tool for generating key points summary
 * Creates highlighted takeaways and important concepts
 */
export const generateKeyPoints = createTool({
  description:
    'Generate a summary of key points, takeaways, or important concepts. Use this to highlight the most critical information students should remember.',
  inputSchema: z.object({
    title: z
      .string()
      .describe('Title for the summary section')
      .default('Key Points'),
    points: z
      .array(
        z.object({
          heading: z.string().describe('Brief heading for this point'),
          description: z.string().describe('Explanation of the key point'),
        })
      )
      .describe('Array of key points to highlight'),
  }),
  execute: async function ({ title, points }) {
    try {
      if (!points || points.length === 0) {
        throw new Error("Must provide at least one key point");
      }

      return {
        title,
        points,
      };
    } catch (error) {
      console.error("Error in generateKeyPoints:", error);
      throw error;
    }
  },
});

/**
 * Tool for generating case studies
 * Creates real-world examples and applications
 */
export const generateCaseStudy = createTool({
  description:
    'Generate a case study showing real-world application of concepts. Use this to demonstrate how theoretical knowledge applies in practice.',
  inputSchema: z.object({
    title: z
      .string()
      .describe('Title of the case study'),
    context: z
      .string()
      .describe('Background and context setting'),
    scenario: z
      .string()
      .describe('The main scenario or problem being addressed'),
    analysis: z
      .string()
      .describe('Analysis of how concepts apply to this scenario'),
    outcome: z
      .string()
      .describe('Results or conclusions from the case study'),
    takeaways: z
      .array(z.string())
      .describe('Key lessons learned from this case study'),
  }),
  execute: async function ({ title, context, scenario, analysis, outcome, takeaways }) {
    try {
      return {
        title,
        context,
        scenario,
        analysis,
        outcome,
        takeaways,
      };
    } catch (error) {
      console.error("Error in generateCaseStudy:", error);
      throw error;
    }
  },
});

type MindMapNode = {
  title: string;
  summary?: string;
  icon?: string;
  color?: string;
  insights?: string[];
  children?: MindMapNode[];
};

const mindMapNodeSchema: z.ZodType<MindMapNode> = z.lazy(() =>
  z.object({
    title: z.string().describe('Title of this node'),
    summary: z.string().describe('Short description for the node').optional(),
    icon: z.string().describe('Emoji or short label representing the node').optional(),
    color: z
      .string()
      .describe('Optional accent color (CSS color value) used when rendering the node')
      .optional(),
    insights: z
      .array(z.string())
      .describe('Extra micro-insights, mnemonics, or examples for this node')
      .optional(),
    children: z
      .array(mindMapNodeSchema)
      .describe('Nested nodes expanding this concept')
      .optional(),
  })
);

export const generateMindMap = createTool({
  description:
    'Generate a hierarchical mind map highlighting the relationships between core ideas. Use this to provide students with a zoomable overview that starts from a central topic and fans out into branches and sub-branches.',
  inputSchema: z.object({
    centralTopic: z.string().describe('Name of the concept that sits at the center of the mind map'),
    perspective: z
      .string()
      .describe('Optional personalization notes such as interests or lens (e.g., basketball, art) used to flavor the map')
      .optional(),
    branches: z
      .array(mindMapNodeSchema)
      .describe('Primary branches connected to the central topic'),
    insights: z
      .array(z.string())
      .describe('Optional list of study tips or prompts derived from the map')
      .optional(),
  }),
  execute: async function ({ centralTopic, perspective, branches, insights }) {
    try {
      if (!branches || branches.length === 0) {
        throw new Error('Mind map must contain at least one branch');
      }

      return {
        centralTopic,
        perspective,
        branches,
        insights,
      };
    } catch (error) {
      console.error('Error in generateMindMap:', error);
      throw error;
    }
  },
});

export const textbookTools = {
  generateTextbookChapter,
  generateExercises,
  generateDiagram,
  generateCodeExample,
  generateKeyPoints,
  generateCaseStudy,
  generateMindMap,
};
