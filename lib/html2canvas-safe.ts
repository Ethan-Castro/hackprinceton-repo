/**
 * Ensures the html2canvas clone uses CSS variables that avoid `lab()` / `oklch()` colors
 * which the library cannot parse. We copy the current root classes (for dark mode, themes, etc.)
 * and then append a safety class that overrides the variables with RGB/HSL fallbacks.
 */
export function applyHtml2CanvasSafePalette(clonedDocument: Document) {
  const sourceRoot = document.documentElement;
  const targetRoot = clonedDocument.documentElement;

  // Preserve existing theme/dark classes so the clone still looks correct
  targetRoot.className = sourceRoot.className;

  // Add a guard class that swaps CSS variables to simple color values
  targetRoot.classList.add("html2canvas-safe");
}
