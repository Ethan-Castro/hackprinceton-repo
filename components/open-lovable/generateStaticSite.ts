"use strict";

type StylePreset = {
  primary: string;
  background: string;
  accent: string;
  label: string;
};

const STYLE_PRESETS: Record<string, StylePreset> = {
  modern: {
    primary: "#FA5D19",
    background: "#ffffff",
    accent: "#262626",
    label: "Modern",
  },
  playful: {
    primary: "#9061ff",
    background: "#f9f9f9",
    accent: "#1f2937",
    label: "Playful",
  },
  professional: {
    primary: "#2a6dfb",
    background: "#f5f5f5",
    accent: "#0f172a",
    label: "Professional",
  },
  artistic: {
    primary: "#eb3424",
    background: "#fafafa",
    accent: "#111827",
    label: "Artistic",
  },
};

export type GenerateHtmlOptions = {
  targetUrl: string;
  style: keyof typeof STYLE_PRESETS;
  instructions?: string;
  sourceTitle?: string;
  sourceDescription?: string;
};

/**
 * Lightweight static HTML generator used to mimic the open-lovable preview flow.
 * This lets us offer an end-to-end experience without relying on the sandbox APIs.
 */
export function generateStaticSiteHtml({
  targetUrl,
  style,
  instructions,
  sourceTitle,
  sourceDescription,
}: GenerateHtmlOptions) {
  const preset = STYLE_PRESETS[style] ?? STYLE_PRESETS.modern;
  const instructionsBlock = instructions
    ? `<div class="note"><strong>Creator note:</strong> ${escapeHtml(
        instructions,
      )}</div>`
    : "";
  const sourceBlock = sourceDescription
    ? `<div class="note"><strong>Source insight${
        sourceTitle ? ` from ${escapeHtml(sourceTitle)}` : ""
      }:</strong> ${escapeHtml(sourceDescription)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${preset.label} Website - Reimagined</title>
  <style>
    :root {
      --primary: ${preset.primary};
      --background: ${preset.background};
      --accent: ${preset.accent};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--background);
      color: #262626;
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: white;
      border-bottom: 1px solid #ededed;
      padding: 1.5rem 2rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    nav {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .logo {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--primary);
    }
    .nav-links { display: flex; gap: 1.25rem; font-size: 0.95rem; color: #4b5563; }
    .nav-links a { color: inherit; text-decoration: none; }
    main {
      max-width: 1200px;
      width: 100%;
      margin: 3rem auto;
      padding: 0 1.5rem 3rem;
      flex: 1;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.85rem;
      background: rgba(0,0,0,0.04);
      color: #374151;
      border-radius: 999px;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin-bottom: 1.25rem;
    }
    .hero {
      text-align: center;
      margin-bottom: 3rem;
    }
    h1 {
      font-size: clamp(2.4rem, 3vw, 3rem);
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, var(--primary), #262626);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { font-size: 1.1rem; color: #4b5563; }
    .cta-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.8rem;
      padding: 0.9rem 1.6rem;
      background: var(--primary);
      color: white;
      text-decoration: none;
      border-radius: 0.75rem;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 12px 30px rgba(0,0,0,0.12);
      font-weight: 700;
    }
    .cta-button:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(0,0,0,0.14); }
    .cta-button:active { transform: translateY(0); }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-top: 2.5rem;
    }
    .feature {
      padding: 1.5rem;
      background: white;
      border-radius: 1rem;
      border: 1px solid #ededed;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .feature:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .feature h3 { margin-bottom: 0.75rem; color: var(--primary); font-size: 1.05rem; }
    .note {
      margin-top: 1.5rem;
      padding: 1rem;
      background: rgba(0,0,0,0.03);
      border-radius: 0.75rem;
      color: #374151;
    }
    footer {
      border-top: 1px solid #ededed;
      padding: 1rem 1.5rem 2rem;
      color: #6b7280;
      background: white;
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <div class="logo">Reimagined</div>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  </header>
  <main>
    <div class="hero">
      <div class="pill">${preset.label} rebuild</div>
      <h1>Welcome to your ${preset.label} experience</h1>
      <p class="subtitle">Reimagined from ${escapeHtml(targetUrl)}</p>
      <a href="#features" class="cta-button">
        View the concept
      </a>
      ${instructionsBlock}
      ${sourceBlock}
    </div>
    <div class="features" id="features">
      <div class="feature">
        <h3>Fast</h3>
        <p>Optimized for modern performance budgets and Core Web Vitals.</p>
      </div>
      <div class="feature">
        <h3>Responsive</h3>
        <p>Layouts adapt seamlessly from mobile to desktop with fluid spacing.</p>
      </div>
      <div class="feature">
        <h3>Beautiful</h3>
        <p>Layered typography and color tokens tailored to the selected style.</p>
      </div>
    </div>
  </main>
  <footer>
    <p>Generated mock powered by Open Lovable workflow.</p>
  </footer>
</body>
</html>`;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
