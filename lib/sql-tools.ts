import { tool as createTool } from "ai";
import { z } from "zod";
import { query } from "./neon";

const MAX_ROWS = 100; // Safety limit for query results
const READONLY_KEYWORDS = ["SELECT", "WITH", "EXPLAIN", "DESCRIBE"];
const DANGEROUS_KEYWORDS = ["DROP", "DELETE", "TRUNCATE", "ALTER", "CREATE", "INSERT", "UPDATE"];

function validateSqlQuery(sql: string): { valid: boolean; error?: string } {
  const trimmedSql = sql.trim().toUpperCase();

  // Check if query starts with a safe keyword
  const startsWithReadonly = READONLY_KEYWORDS.some((keyword) =>
    trimmedSql.startsWith(keyword)
  );

  if (!startsWithReadonly) {
    return {
      valid: false,
      error: "Only SELECT, WITH, EXPLAIN, and DESCRIBE queries are allowed for safety reasons",
    };
  }

  // Check for dangerous keywords anywhere in the query
  for (const keyword of DANGEROUS_KEYWORDS) {
    if (trimmedSql.includes(keyword)) {
      return {
        valid: false,
        error: `Query contains dangerous keyword: ${keyword}. Only read operations are allowed.`,
      };
    }
  }

  // Check for comments that might hide dangerous commands
  if (sql.includes("--") || sql.includes("/*")) {
    return {
      valid: false,
      error: "SQL comments are not allowed for security reasons",
    };
  }

  return { valid: true };
}

export type SqlQueryResult = {
  query: string;
  rows: Record<string, any>[];
  columns: string[];
  rowCount: number;
  executionTime: number;
};

export type SqlToolOutput = {
  success: boolean;
  result?: SqlQueryResult;
  error?: string;
};

export const executeSQL = createTool({
  description:
    "Execute a SQL query against the database. Only SELECT and read operations are allowed for security. Returns query results in tabular format.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("The SQL query to execute. Only SELECT queries allowed."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(MAX_ROWS)
      .default(100)
      .describe(`Maximum number of rows to return (max ${MAX_ROWS})`),
  }),
  execute: async ({ query: sqlQuery, limit }): Promise<SqlToolOutput> => {
    const startTime = Date.now();

    try {
      // Validate query
      const validation = validateSqlQuery(sqlQuery);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Add LIMIT clause if not present
      let finalQuery = sqlQuery.trim();
      if (!finalQuery.toUpperCase().includes("LIMIT")) {
        finalQuery += ` LIMIT ${Math.min(limit, MAX_ROWS)}`;
      } else {
        // Ensure LIMIT doesn't exceed max
        finalQuery = finalQuery.replace(
          /LIMIT\s+(\d+)/i,
          `LIMIT ${Math.min(parseInt(RegExp.$1) || limit, MAX_ROWS)}`
        );
      }

      // Execute query
      const results = await query<Record<string, any>>(finalQuery);

      if (!results || results.length === 0) {
        return {
          success: true,
          result: {
            query: sqlQuery,
            rows: [],
            columns: [],
            rowCount: 0,
            executionTime: Date.now() - startTime,
          },
        };
      }

      // Extract column names from first row
      const columns = Object.keys(results[0]);

      return {
        success: true,
        result: {
          query: sqlQuery,
          rows: results,
          columns,
          rowCount: results.length,
          executionTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `SQL query failed: ${errorMessage}`,
      };
    }
  },
});

export const describeTable = createTool({
  description:
    "Get the schema information for a table (column names, types, constraints)",
  inputSchema: z.object({
    tableName: z
      .string()
      .describe("Name of the table to describe"),
  }),
  execute: async ({ tableName }): Promise<SqlToolOutput> => {
    const startTime = Date.now();

    try {
      // Validate table name (only alphanumeric, underscore, dash)
      if (!/^[a-zA-Z0-9_\-]+$/.test(tableName)) {
        return {
          success: false,
          error: "Invalid table name",
        };
      }

      const describeQuery = `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `;

      const results = await query<Record<string, any>>(
        describeQuery,
        [tableName]
      );

      if (!results || results.length === 0) {
        return {
          success: false,
          error: `Table '${tableName}' not found`,
        };
      }

      const columns = Object.keys(results[0]);

      return {
        success: true,
        result: {
          query: `DESCRIBE ${tableName}`,
          rows: results,
          columns,
          rowCount: results.length,
          executionTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to describe table: ${errorMessage}`,
      };
    }
  },
});

export const sqlTools = {
  executeSQL,
  describeTable,
};
