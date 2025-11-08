# AI Tools Documentation

This document describes the AI tools available in the chat interface and how the LLM can use them to create rich, interactive experiences.

## Available Tools

### 1. `displayArtifact`

Display content in a structured artifact container with optional title, description, and action buttons.

**When to use:**
- Showing code snippets with syntax highlighting
- Displaying documentation or text content
- Presenting structured data or reports
- Any content that benefits from a titled container with copy/download actions

**Parameters:**
```typescript
{
  title?: string;          // Optional title for the artifact header
  description?: string;    // Optional description below the title
  content: string;         // The main content to display (required)
  contentType: 'code' | 'text' | 'markdown' | 'html';  // Type of content
  language?: string;       // Programming language for syntax highlighting (if contentType is 'code')
}
```

**Example usage:**
```typescript
// Display a JavaScript code snippet
displayArtifact({
  title: "React Component Example",
  description: "A simple counter component using hooks",
  content: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`,
  contentType: "code",
  language: "javascript"
});
```

**Features:**
- Automatic copy-to-clipboard button
- Download button for saving content
- Syntax highlighting for code
- Clean, bordered presentation

---

### 2. `displayWebPreview`

Display a live preview of an existing webpage or URL with navigation controls.

**When to use:**
- Previewing external websites
- Showing documentation pages
- Displaying online resources
- Viewing any web content via URL

**Parameters:**
```typescript
{
  url: string;            // The URL to display (required, must be valid URL)
  title?: string;         // Optional title for the preview
  description?: string;   // Optional description
}
```

**Example usage:**
```typescript
// Display a website preview
displayWebPreview({
  url: "https://vercel.com/docs/ai",
  title: "Vercel AI SDK Documentation",
  description: "Official documentation for the Vercel AI SDK"
});
```

**Features:**
- Interactive iframe with the webpage
- Navigation controls (back, forward, refresh)
- URL bar for viewing/changing URLs
- Responsive design

---

### 3. `generateHtmlPreview`

Generate and display a live HTML preview with the ability to toggle between preview and code view.

**When to use:**
- Creating interactive UI components or demos
- Building custom HTML pages
- Generating HTML/CSS/JavaScript examples
- Showing live code results
- Creating visualizations or interactive elements

**Parameters:**
```typescript
{
  html: string;           // Complete HTML content including CSS and JavaScript (required)
  title?: string;         // Optional title describing the preview
  description?: string;   // Optional description
}
```

**Example usage:**
```typescript
// Generate an interactive HTML demo
generateHtmlPreview({
  title: "Interactive Color Picker",
  description: "A simple color picker built with vanilla JavaScript",
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Color Picker</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f0f0f0;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
    }
    .color-box {
      width: 200px;
      height: 200px;
      margin: 1rem auto;
      border-radius: 0.5rem;
      border: 2px solid #ddd;
      transition: background-color 0.3s ease;
    }
    input[type="color"] {
      width: 200px;
      height: 50px;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }
    .hex-value {
      font-size: 1.5rem;
      font-weight: bold;
      margin-top: 1rem;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Color Picker</h1>
    <div class="color-box" id="colorBox"></div>
    <input type="color" id="colorPicker" value="#3b82f6">
    <div class="hex-value" id="hexValue">#3b82f6</div>
  </div>
  
  <script>
    const colorPicker = document.getElementById('colorPicker');
    const colorBox = document.getElementById('colorBox');
    const hexValue = document.getElementById('hexValue');
    
    colorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      colorBox.style.backgroundColor = color;
      hexValue.textContent = color;
    });
    
    // Initialize
    colorBox.style.backgroundColor = colorPicker.value;
  </script>
</body>
</html>`
});
```

**Features:**
- Live preview of generated HTML
- Toggle between Preview and Code view
- Copy HTML source code to clipboard
- Full HTML/CSS/JavaScript support
- Navigation controls in preview mode

---

## Best Practices

### When to Use Each Tool

1. **Use `displayArtifact`** when:
   - User asks for code examples
   - Sharing configuration files
   - Displaying structured text or documentation
   - The content doesn't need to be interactive

2. **Use `displayWebPreview`** when:
   - User asks to see an existing website
   - Referencing online documentation
   - Showing external resources
   - The content is already hosted somewhere

3. **Use `generateHtmlPreview`** when:
   - User asks to create a UI component
   - Building interactive demos
   - Creating visualizations
   - The content should be executable/interactive

### Tips for Better Results

1. **Always provide descriptive titles and descriptions** to help users understand what they're looking at

2. **For code artifacts**, always specify the `language` parameter for proper syntax highlighting

3. **For HTML previews**, ensure:
   - Complete, valid HTML structure
   - Include `<!DOCTYPE html>` and proper meta tags
   - Inline all CSS and JavaScript
   - Test responsive design with viewport meta tag

4. **Consider user context**:
   - If they ask "show me", use a preview tool
   - If they ask "give me the code", use an artifact
   - If they want both, use `generateHtmlPreview` which supports both views

### Example Conversations

**Example 1: User asks for code**
```
User: "Can you show me a Python function to sort a list?"