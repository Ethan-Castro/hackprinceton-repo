import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/neon";

type DeploymentRow = {
  component_html: string | null;
  component_code: string | null;
  deployment_status?: string | null;
  model_used?: string | null;
  created_at?: string | null;
};

function buildPreviewHTML(componentCode: string): string {
  const nameMatch = componentCode.match(/export default function (\w+)/);
  const componentName = nameMatch ? nameMatch[1] : "GeneratedComponent";

  let processedCode = componentCode.replace(/export default function (\w+)/, "function $1");
  processedCode = processedCode.replace(/export default const (\w+)\s*=/g, "const $1 =");
  processedCode = processedCode.replace(/export default /g, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${componentName} - Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useCallback, useMemo, useRef, useReducer, useContext, createContext, Fragment } = React;

    ${processedCode}

    setTimeout(function() {
      try {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        if (typeof ${componentName} !== 'undefined') {
          root.render(React.createElement(${componentName}));
        } else {
          document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Component ${componentName} not found</div>';
        }
      } catch (err) {
        console.error('Render error:', err);
        document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: ' + err.message + '</div>';
      }
    }, 200);
  </script>
</body>
</html>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: previewId } = await params;

  if (!previewId) {
    return NextResponse.json({ error: "Preview id is required" }, { status: 400 });
  }

  try {
    const record = await queryOne<DeploymentRow>(
      `SELECT component_html, component_code, deployment_status, model_used, created_at FROM v0_deployments WHERE preview_id = $1 LIMIT 1`,
      [previewId]
    );

    if (!record) {
      return NextResponse.json({ error: "Preview not found" }, { status: 404 });
    }

    if (record.deployment_status && record.deployment_status !== "active") {
      return NextResponse.json({ error: "Preview unavailable" }, { status: 410 });
    }

    let html = record.component_html;
    if (!html && record.component_code) {
      html = buildPreviewHTML(record.component_code);
    }

    if (!html) {
      return NextResponse.json({ error: "Preview not found" }, { status: 404 });
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        ...(record.model_used ? { "X-Generated-By": record.model_used } : {}),
        ...(record.created_at ? { "X-Created-At": record.created_at } : {}),
      },
    });
  } catch (error) {
    console.error("[preview] Failed to load preview:", error);
    return NextResponse.json({ error: "Failed to load preview" }, { status: 500 });
  }
}

