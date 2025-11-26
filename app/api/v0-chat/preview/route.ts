import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const data = req.nextUrl.searchParams.get("data");
  const type = req.nextUrl.searchParams.get("type");

  if (!data && !id) {
    return NextResponse.json({ error: "data or id is required" }, { status: 400 });
  }

  try {
    if (data) {
      const decodedContent = Buffer.from(data, "base64url").toString("utf8");
      
      if (type === 'react') {
        let componentCode = decodedContent;
        
        // Extract the component name
        const componentNameMatch = componentCode.match(/export default function (\w+)/);
        const componentName = componentNameMatch ? componentNameMatch[1] : "GeneratedComponent";

        // Remove 'export default' to make function globally accessible
        componentCode = componentCode.replace(/export default function (\w+)/, 'function $1');
        componentCode = componentCode.replace(/export default const (\w+)\s*=/g, 'const $1 =');
        componentCode = componentCode.replace(/export default /g, '');

        // Create HTML that renders React component
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Preview</title>
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
    // Make React hooks available globally
    const { useState, useEffect, useCallback, useMemo, useRef, useReducer, useContext, createContext, Fragment } = React;
    
    // Component code (export default removed)
    ${componentCode}
    
    // Render after Babel processes the code above
    // Use setTimeout to ensure Babel has finished transpiling
    setTimeout(function() {
      try {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        if (typeof ${componentName} !== 'undefined') {
          root.render(React.createElement(${componentName}));
        } else {
          // Fallback: try to find any function that matches
          const possibleNames = ['${componentName}', 'GeneratedComponent', 'App', 'Component'];
          let foundComponent = null;
          for (const name of possibleNames) {
            if (typeof window[name] !== 'undefined') {
              foundComponent = window[name];
              break;
            }
          }
          if (foundComponent) {
            root.render(React.createElement(foundComponent));
          } else {
            document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Component ${componentName} not found. Available: ' + Object.keys(window).filter(k => typeof window[k] === 'function').join(', ') + '</div>';
          }
        }
      } catch (err) {
        console.error('Render error:', err);
        document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: ' + err.message + '<br><pre>' + err.stack + '</pre></div>';
      }
    }, 200);
  </script>
</body>
</html>`;
        
        return new NextResponse(html, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } else {
        // Default HTML behavior (legacy)
        return new NextResponse(decodedContent, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  } catch (error: any) {
    console.error("[v0-chat] Preview load error:", error);
    return NextResponse.json(
      { error: "Failed to load preview" },
      { status: 500 }
    );
  }
}
