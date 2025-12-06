// Tool display name mapping for accurate UI labels
// This mapping provides human-readable names for tools displayed in the UI

export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  // Search & Research Tools
  webSearch: "Web Search (Exa)",
  valyuWebSearch: "Web Search (Valyu)",
  financeSearch: "Finance Search",
  paperSearch: "Academic Paper Search",
  bioSearch: "Biomedical Search",
  patentSearch: "Patent Search (USPTO)",
  secSearch: "SEC Filings Search",
  economicsSearch: "Economics Data Search",
  companyResearch: "Company Research",
  searchArXiv: "arXiv Search",
  getArXivPaper: "arXiv Paper Retrieval",
  scrapeWebsite: "Website Scraper",

  // Visualization & Display Tools
  displayArtifact: "Display Artifact",
  displayWebPreview: "Web Preview",
  generateHtmlPreview: "HTML Preview",
  generateChart: "Chart Generator",
  generateMermaidDiagram: "Mermaid Diagram",
  generateFlowchart: "Flowchart Generator",
  generateERDiagram: "ER Diagram Generator",

  // Code & Data Tools
  executePython: "Python Execution",
  analyzeDataset: "Dataset Analysis",
  executeSQL: "SQL Query",
  describeTable: "Table Schema",
  runParallelAgent: "Parallel Agent",

  // Content Tools
  generateTextbookChapter: "Textbook Chapter",
  generateExercises: "Exercise Generator",
  generateDiagram: "Diagram Generator",
  generateCodeExample: "Code Example",
  generateKeyPoints: "Key Points",
  generateCaseStudy: "Case Study",
  generateMindMap: "Mind Map",
  renderTemplateDocument: "Template Renderer",

  // Business Tools
  generateBusinessPlan: "Business Plan",
  generateMarketAnalysis: "Market Analysis",
  generateFinancialReport: "Financial Report",

  // Healthcare Tools
  medicalResearch: "Medical Research",
  searchClinicalTrials: "Clinical Trials Search",
  getDrugInfo: "Drug Information",

  // Communication Tools
  sendEmail: "Send Email",
  voiceAlert: "Voice Alert",
};

/**
 * Get the display name for a tool
 * @param toolName - The internal tool name (e.g., "webSearch", "financeSearch")
 * @returns The human-readable display name
 */
export function getToolDisplayName(toolName: string): string {
  // Remove "tool-" prefix if present
  const name = toolName.replace(/^tool-/, "");

  // Check if we have a custom display name
  if (TOOL_DISPLAY_NAMES[name]) {
    return TOOL_DISPLAY_NAMES[name];
  }

  // Fallback: Convert camelCase/snake_case/kebab-case to Title Case
  return name
    .replace(/([A-Z])/g, " $1") // camelCase to spaces
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
}
