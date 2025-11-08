"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { SqlToolOutput, SqlQueryResult } from "@/lib/sql-tools";
import { AlertCircle, CheckCircle2, Database, Table, ChevronDown } from "lucide-react";
import { useState } from "react";

export function SQLResultsRenderer({ data }: { data: SqlToolOutput }) {
  const [expandedSection, setExpandedSection] = useState<string>("results");

  if (!data.success || !data.result) {
    return (
      <Card className="w-full shadow-border-medium border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            SQL Query Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto text-destructive">
            {data.error || "Unknown error occurred"}
          </pre>
        </CardContent>
      </Card>
    );
  }

  const result: SqlQueryResult = data.result;

  return (
    <Card className="w-full shadow-border-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          SQL Query Results
        </CardTitle>
        <CardDescription>
          {result.rowCount} row{result.rowCount !== 1 ? "s" : ""} returned in {result.executionTime}ms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Collapsible
          open={expandedSection === "results"}
          onOpenChange={(open) => setExpandedSection(open ? "results" : "")}
        >
          <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors w-full">
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSection === "results" ? "rotate-180" : ""
              }`}
            />
            <Table className="h-4 w-4" />
            Results
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            {result.rows.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted">
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left font-medium"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        {result.columns.map((col) => (
                          <td
                            key={`${rowIndex}-${col}`}
                            className="px-4 py-2"
                          >
                            <div className="max-w-xs truncate">
                              {formatCellValue(row[col])}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No results found
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={expandedSection === "query"}
          onOpenChange={(open) => setExpandedSection(open ? "query" : "")}
        >
          <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-sm hover:text-foreground transition-colors w-full">
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSection === "query" ? "rotate-180" : ""
              }`}
            />
            <Database className="h-4 w-4" />
            Query
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-muted p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                <code>{result.query}</code>
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function formatCellValue(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}
