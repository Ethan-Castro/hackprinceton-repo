import { tool as createTool } from "ai";
import { z } from "zod";
import CodeInterpreter from "@e2b/code-interpreter";

function getE2BApiKey(): string {
  const apiKey = process.env.E2B_API_KEY;
  if (!apiKey) {
    throw new Error("E2B_API_KEY environment variable is not set");
  }
  return apiKey;
}

export type PythonExecutionResult = {
  code: string;
  output: string;
  plots: string[]; // base64 encoded images
  dataframes: Record<string, any>[];
  stdout: string;
  stderr: string;
  executionTime: number;
};

export type PythonToolOutput = {
  success: boolean;
  result?: PythonExecutionResult;
  error?: string;
};

export const executePython = createTool({
  description:
    "Execute Python code in a sandboxed environment with data science libraries (NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn). Use this for data analysis, mathematical computations, and data visualization.",
  inputSchema: z.object({
    code: z
      .string()
      .describe("The Python code to execute. Must be valid Python syntax."),
    description: z
      .string()
      .optional()
      .describe("Brief description of what the code does"),
    packages: z
      .array(z.string())
      .optional()
      .describe(
        "Additional Python packages to install via pip (e.g., ['scikit-learn', 'statsmodels'])"
      ),
  }),
  execute: async ({
    code,
    description,
    packages,
  }): Promise<PythonToolOutput> => {
    const startTime = Date.now();

    try {
      const apiKey = getE2BApiKey();
      const sandbox = await CodeInterpreter.create({
        apiKey,
      });

      try {
        // Install additional packages if specified
        if (packages && packages.length > 0) {
          for (const pkg of packages) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (sandbox as any).exec(`import subprocess
subprocess.check_call(['pip', 'install', '--quiet', '${pkg}'])`);
            } catch (error) {
              console.warn(`Failed to install package: ${pkg}`);
            }
          }
        }

        // Prepare code with plot detection
        const wrappedCode = `
import io
import base64
import matplotlib.pyplot as plt
import sys
from contextlib import redirect_stdout, redirect_stderr

# Capture output
stdout_capture = io.StringIO()
stderr_capture = io.StringIO()
plots = []

try:
    with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
        ${code.split("\n").join("\n        ")}
except Exception as e:
    stderr_capture.write(str(e))

# Capture plots
for i, fig in enumerate(plt.get_fignums()):
    buf = io.BytesIO()
    plt.figure(fig).savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    plots.append(base64.b64encode(buf.read()).decode('utf-8'))
    plt.close(fig)

_stdout = stdout_capture.getvalue()
_stderr = stderr_capture.getvalue()
_plots = plots
`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (sandbox as any).exec(wrappedCode);

        // Extract results
        let plots: string[] = [];
        let stdout = "";
        let stderr = "";

        if (result.text) {
          // Parse the output if it contains our captured variables
          stdout = result.text;
        }

        if (result.error) {
          stderr = result.error.message || String(result.error);
        }

        // Try to get plots if they exist
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const plotsResult = await (sandbox as any).exec("_plots");
          if (plotsResult && Array.isArray(plotsResult)) {
            plots = plotsResult as string[];
          }
        } catch {
          // Plots might not be available
        }

        const executionTime = Date.now() - startTime;

        return {
          success: true,
          result: {
            code,
            output: stdout || "Code executed successfully",
            plots,
            dataframes: [],
            stdout,
            stderr,
            executionTime,
          },
        };
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (sandbox as any).close();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Python execution failed: ${errorMessage}`,
      };
    }
  },
});

export const analyzeDataset = createTool({
  description:
    "Perform statistical analysis on a dataset (descriptive statistics, correlation analysis, distribution analysis)",
  inputSchema: z.object({
    data: z
      .array(z.record(z.string(), z.any()))
      .describe("Array of objects representing your dataset"),
    analysisType: z
      .enum(["descriptive", "correlation", "distribution"])
      .describe("Type of analysis to perform"),
    columns: z
      .array(z.string())
      .optional()
      .describe("Specific columns to analyze (if not specified, all numeric columns)"),
  }),
  execute: async ({
    data,
    analysisType,
    columns,
  }): Promise<PythonToolOutput> => {
    const startTime = Date.now();

    try {
      const apiKey = getE2BApiKey();
      const sandbox = await CodeInterpreter.create({
        apiKey,
      });

      try {
        // Convert data to Python and run analysis
        const dataJson = JSON.stringify(data);

        const analysisCode = `
import pandas as pd
import json
import numpy as np
from scipy import stats

# Load data
data_json = '''${dataJson}'''
df = pd.DataFrame(json.loads(data_json))

# Select columns
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
${columns ? `analysis_cols = ${JSON.stringify(columns)}` : `analysis_cols = numeric_cols`}

analysis_result = {}

${
  analysisType === "descriptive"
    ? `
analysis_result['descriptive'] = df[analysis_cols].describe().to_dict()
analysis_result['missing_values'] = df[analysis_cols].isnull().sum().to_dict()
analysis_result['data_types'] = df[analysis_cols].dtypes.astype(str).to_dict()
`
    : analysisType === "correlation"
      ? `
analysis_result['correlation_matrix'] = df[analysis_cols].corr().to_dict()
for col in analysis_cols:
    analysis_result[f'{col}_skewness'] = float(stats.skew(df[col].dropna()))
`
      : `
for col in analysis_cols:
    analysis_result[f'{col}_distribution'] = {
        'mean': float(df[col].mean()),
        'median': float(df[col].median()),
        'std': float(df[col].std()),
        'min': float(df[col].min()),
        'max': float(df[col].max()),
        'q25': float(df[col].quantile(0.25)),
        'q75': float(df[col].quantile(0.75))
    }
`
}

print(json.dumps(analysis_result, indent=2))
`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (sandbox as any).exec(analysisCode);

        const executionTime = Date.now() - startTime;

        return {
          success: true,
          result: {
            code: analysisCode,
            output: result.text || "Analysis completed",
            plots: [],
            dataframes: [],
            stdout: result.text || "",
            stderr: result.error?.message || "",
            executionTime,
          },
        };
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (sandbox as any).close();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Dataset analysis failed: ${errorMessage}`,
      };
    }
  },
});

export const pythonTools = {
  executePython,
  analyzeDataset,
};
