import { streamText, generateText } from "ai";
import { resolveModel } from "@/lib/agents/model-factory";

// Default model for dashboard generation - Claude Sonnet is best for React code generation
const DEFAULT_DASHBOARD_MODEL = "anthropic/claude-sonnet-4.5";

/**
 * System prompt that constrains the model to generate Sandpack-compatible React code
 */
const DASHBOARD_SYSTEM_PROMPT = `You are an expert React Engineer specializing in Business Intelligence dashboards.

Your goal: Create a single-file React component that visualizes the user's data in an interactive dashboard.

## Environment Constraints (STRICT)

You are running in a Sandpack environment with these pre-installed dependencies:
- react (latest)
- react-dom (latest)
- recharts@3.3.0
- lucide-react@latest
- clsx@latest
- tailwind-merge@latest

## Code Requirements

1. **Single File Component**: All code must be in one file. Use \`export default function App() { ... }\` as the entry point.

2. **Imports**: You may ONLY import from:
   - \`react\` (useState, useEffect, useMemo, etc.)
   - \`recharts\` (LineChart, BarChart, PieChart, AreaChart, Line, Bar, Pie, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, etc.)
   - \`lucide-react\` (TrendingUp, TrendingDown, DollarSign, Users, Activity, BarChart3, PieChart as PieIcon, ArrowUp, ArrowDown, Filter, RefreshCw, etc.)
   - \`clsx\` (for conditional classes)
   - \`tailwind-merge\` (if needed)

3. **NO Local Imports**: You CANNOT import local files (e.g., no \`@/components/...\`, no \`./components\`). 
   All UI elements (buttons, sliders, cards, inputs) must be:
   - Defined inline using standard HTML elements with Tailwind CSS
   - Or created as local components within the same file (e.g., const Card = ({ children }) => ...)

4. **Styling**: Use Tailwind CSS classes exclusively. Sandpack includes Tailwind automatically.
   - Use modern, professional styling with appropriate spacing
   - Include dark mode support where appropriate (dark: prefix)
   - Use responsive design (sm:, md:, lg: prefixes)

5. **Data**: Hardcode the extracted data directly into a \`const data = [...]\` variable inside the component.
   - Transform the provided structured data into the format needed for Recharts
   - Include meaningful labels and values

6. **Interactivity**: The visualization MUST be interactive. Use \`useState\` to let users:
   - Filter data by category, date range, or other relevant dimensions
   - Adjust assumptions using sliders or input fields
   - Toggle between different views or chart types
   - Show/hide different data series

7. **Layout**: Create a well-structured dashboard with:
   - A header with title and key metrics (cards)
   - Interactive controls section
   - Main visualization area with charts
   - Use CSS Grid or Flexbox for layout

## Output Format

Output ONLY the React component code. Do not include:
- Markdown code fences (\`\`\`jsx or \`\`\`tsx)
- Explanations before or after the code
- Package.json or other configuration files
- Comments explaining what the code does (minimal inline comments are OK)

Start directly with: \`import React, { useState } from 'react';\`

## Example Structure

import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Filter } from 'lucide-react';
import clsx from 'clsx';

const data = [
  { month: 'Jan', revenue: 4000, profit: 2400, users: 240 },
  { month: 'Feb', revenue: 3000, profit: 1398, users: 221 },
  // ... more data extracted from the input
];

// Local Card component
const Card = ({ children, className }) => (
  <div className={clsx("bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", className)}>
    {children}
  </div>
);

// Local MetricCard component
const MetricCard = ({ title, value, icon: Icon, trend }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <Icon className="h-8 w-8 text-blue-500" />
    </div>
  </Card>
);

export default function App() {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [showComparison, setShowComparison] = useState(true);
  
  // Computed values
  const totalRevenue = useMemo(() => data.reduce((sum, item) => sum + item.revenue, 0), []);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Revenue Dashboard</h1>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Revenue" value={\`$\${totalRevenue.toLocaleString()}\`} icon={DollarSign} />
        {/* More cards... */}
      </div>
      
      {/* Controls */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="revenue">Revenue</option>
            <option value="profit">Profit</option>
            <option value="users">Users</option>
          </select>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={showComparison} 
              onChange={(e) => setShowComparison(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Show comparison</span>
          </label>
        </div>
      </Card>
      
      {/* Main Chart */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Trend Analysis</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={selectedMetric} stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

Remember: This code will run directly in Sandpack. Keep it simple, self-contained, and interactive.`;

/**
 * System prompt for data cleaning/structuring pass
 */
const DATA_CLEANING_PROMPT = `You are a data extraction specialist. Your task is to extract structured data from messy PDF text.

Rules:
1. Output ONLY valid JSON - no explanations, no markdown
2. If you find tables, convert them to arrays of objects with meaningful keys
3. If you find key metrics or KPIs, create a structured object with them
4. Preserve numerical values accurately
5. Clean up formatting issues (extra spaces, broken lines, etc.)
6. If the text mentions time periods, include them in the data structure
7. Group related data together logically

Output format example:
{
  "title": "Quarterly Revenue Report",
  "period": "Q4 2024",
  "metrics": {
    "totalRevenue": 1500000,
    "growth": 15.5,
    "customers": 2400
  },
  "timeSeries": [
    { "month": "Oct", "revenue": 480000, "costs": 320000 },
    { "month": "Nov", "revenue": 520000, "costs": 340000 },
    { "month": "Dec", "revenue": 500000, "costs": 330000 }
  ],
  "categories": [
    { "name": "Product A", "value": 600000, "share": 40 },
    { "name": "Product B", "value": 450000, "share": 30 }
  ]
}`;

/**
 * System prompt for refining existing dashboard code
 */
const REFINEMENT_SYSTEM_PROMPT = `You are an expert React Engineer. You have been given an existing React dashboard component and a user request to modify it.

Your task: Modify the existing code according to the user's request while maintaining all the original constraints.

## Environment Constraints (STRICT - Same as original)

You are running in a Sandpack environment with these pre-installed dependencies:
- react, react-dom, recharts@3.3.0, lucide-react, clsx, tailwind-merge

## Rules:
1. Keep all existing functionality that wasn't explicitly asked to change
2. Maintain the same code structure and patterns
3. Only import from allowed packages (react, recharts, lucide-react, clsx, tailwind-merge)
4. No local imports (@/components, ./utils, etc.)
5. Output ONLY the modified React code - no markdown fences, no explanations

Common modifications:
- "Make it a bar chart" → Change LineChart to BarChart, Line to Bar
- "Add a filter" → Add useState and a select/checkbox control
- "Change colors" → Update stroke/fill colors
- "Add more metrics" → Add more MetricCard components
- "Make it responsive" → Add responsive Tailwind classes`;

export interface DashboardGenerationOptions {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Clean and structure messy PDF text into JSON format
 */
export async function cleanAndStructureData(
  rawText: string,
  options: DashboardGenerationOptions = {}
): Promise<string> {
  const { modelId = DEFAULT_DASHBOARD_MODEL } = options;
  const { model } = resolveModel(modelId);

  const result = await generateText({
    model,
    system: DATA_CLEANING_PROMPT,
    prompt: `Extract and structure the following text into clean JSON format:\n\n${rawText}`,
    temperature: 0.3, // Lower temperature for more consistent JSON output
    maxTokens: 2000,
  });

  return result.text;
}

/**
 * Generate React dashboard code from structured data
 * Returns a streaming result for progressive rendering
 */
export async function generateDashboardCode(
  structuredData: string,
  userGoal: string,
  options: DashboardGenerationOptions = {}
) {
  const { 
    modelId = DEFAULT_DASHBOARD_MODEL,
    temperature = 0.7,
    maxTokens = 4096
  } = options;
  
  const { model } = resolveModel(modelId);

  const result = streamText({
    model,
    system: DASHBOARD_SYSTEM_PROMPT,
    prompt: `Based on this structured data and user goal, generate an interactive React dashboard:

User Goal: ${userGoal}

Structured Data:
${structuredData}

Generate a complete, self-contained React component that visualizes this data with interactive controls.`,
    temperature,
    maxTokens,
  });

  return result;
}

/**
 * Two-pass strategy: Clean PDF text, then generate dashboard
 * This is the main entry point for dashboard generation from raw text
 */
export async function generateDashboardFromText(
  rawText: string,
  userGoal: string = "Create an interactive dashboard visualizing this data",
  options: DashboardGenerationOptions = {}
) {
  const { modelId = DEFAULT_DASHBOARD_MODEL } = options;
  const { model } = resolveModel(modelId);

  // For very clean/structured input, skip the cleaning pass
  const isAlreadyStructured = rawText.trim().startsWith('{') || rawText.trim().startsWith('[');
  
  let structuredData: string;
  
  if (isAlreadyStructured) {
    structuredData = rawText;
  } else {
    // Pass 1: Clean and structure the data
    console.log("[Dashboard Generator] Pass 1: Cleaning and structuring data...");
    structuredData = await cleanAndStructureData(rawText, options);
    console.log("[Dashboard Generator] Pass 1 complete. Structured data ready.");
  }

  // Pass 2: Generate React code
  console.log("[Dashboard Generator] Pass 2: Generating React dashboard code...");
  const result = streamText({
    model,
    system: DASHBOARD_SYSTEM_PROMPT,
    prompt: `Based on this structured data and user goal, generate an interactive React dashboard:

User Goal: ${userGoal}

Structured Data:
${structuredData}

Generate a complete, self-contained React component that visualizes this data with interactive controls. Make it visually appealing with a modern design.`,
    temperature: 0.7,
    maxTokens: 4096,
  });

  return result;
}

/**
 * Refine existing dashboard code based on user feedback
 */
export async function refineDashboardCode(
  currentCode: string,
  userRequest: string,
  options: DashboardGenerationOptions = {}
) {
  const { 
    modelId = DEFAULT_DASHBOARD_MODEL,
    temperature = 0.7,
    maxTokens = 4096
  } = options;
  
  const { model } = resolveModel(modelId);

  const result = streamText({
    model,
    system: REFINEMENT_SYSTEM_PROMPT,
    prompt: `Here is the current React dashboard code:

\`\`\`jsx
${currentCode}
\`\`\`

User request: "${userRequest}"

Modify the code according to the user's request. Output ONLY the complete modified React code.`,
    temperature,
    maxTokens,
  });

  return result;
}

/**
 * Direct code generation without data cleaning (for when data is already structured)
 */
export async function generateDashboardDirect(
  structuredData: string,
  userGoal: string,
  options: DashboardGenerationOptions = {}
) {
  return generateDashboardCode(structuredData, userGoal, options);
}

