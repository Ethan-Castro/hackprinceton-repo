export type CustomFont =
  | "geist"
  | "editorial"
  | "professional"
  | "creative"
  | "classic"
  | "technical";

export const FONT_VARIABLES: Record<CustomFont, { sans: string; mono: string }> = {
  geist: { sans: "--font-geist-sans", mono: "--font-geist-mono" },
  editorial: { sans: "--font-playfair", mono: "--font-fira-code" },
  professional: { sans: "--font-dm-sans", mono: "--font-jetbrains-mono" },
  creative: { sans: "--font-space-grotesk", mono: "--font-space-mono" },
  classic: { sans: "--font-libre-baskerville", mono: "--font-ibm-plex-mono" },
  technical: { sans: "--font-inter", mono: "--font-source-code-pro" },
};

export const FONT_IDS = Object.keys(FONT_VARIABLES) as CustomFont[];

export const isCustomFont = (fontId: string | null): fontId is CustomFont =>
  Boolean(fontId && FONT_IDS.includes(fontId as CustomFont));

export const applyFontSelection = (fontId: CustomFont | null) => {
  if (typeof document === "undefined") return;

  const fontKey: CustomFont = fontId ?? "geist";
  const fontConfig = FONT_VARIABLES[fontKey] ?? FONT_VARIABLES.geist;
  const sansStack = `var(${fontConfig.sans}), ui-sans-serif, system-ui, sans-serif`;
  const monoStack = `var(${fontConfig.mono}), ui-monospace, monospace`;

  // Remove existing font-* classes so only the active font remains.
  FONT_IDS.forEach((id) => {
    document.documentElement.classList.remove(`font-${id}`);
  });

  document.documentElement.classList.add(`font-${fontKey}`);

  // Inline custom properties override @theme defaults so utilities pick up instantly.
  [document.documentElement, document.body].forEach((el) => {
    if (!el) return;
    el.style.setProperty("--font-sans", `var(${fontConfig.sans})`);
    el.style.setProperty("--font-mono", `var(${fontConfig.mono})`);
    el.style.fontFamily = sansStack;
    el.dataset.font = fontKey;
  });

  // Ensure existing monospaced elements render with the chosen mono stack immediately.
  document.querySelectorAll<HTMLElement>("code, pre, kbd, samp").forEach((node) => {
    node.style.fontFamily = monoStack;
  });
};
