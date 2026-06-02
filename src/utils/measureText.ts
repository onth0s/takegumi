/**
 * Offscreen/Headless text measurement using Canvas.
 *
 * @planned Phase 2 target (misc/PLAN.md) — replace ResizeObserver sizing in useWPath.
 * Kept as scaffold; not wired into the render pipeline yet.
 *
 * NOTE: This module contains browser-only APIs (HTMLCanvasElement, OffscreenCanvas).
 * The module-level variables are null in SSR contexts (Node) — that is intentional.
 * The `measureText` function returns a rough character-count estimate on SSR.
 * Do NOT add DOM calls at module scope below this comment block.
 */

import { DEFAULT_WTB_FONT_SIZE } from "@/constants/canvasDefaults";

interface MeasureStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  lineHeight?: number;
  maxWidth?: number;
}

export interface MeasuredDimensions {
  width: number;
  height: number;
  lines: string[];
}

// Module-level canvas instances — created once, reused on every call.
let canvasElement: HTMLCanvasElement | null = null;
let offscreenElement: OffscreenCanvas | null = null;

function getCanvasContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  if (typeof window === "undefined") return null;

  if (typeof OffscreenCanvas !== "undefined") {
    if (!offscreenElement) offscreenElement = new OffscreenCanvas(1, 1);
    return offscreenElement.getContext("2d");
  }

  if (!canvasElement) {
    canvasElement = document.createElement("canvas");
    canvasElement.width = 1;
    canvasElement.height = 1;
  }
  return canvasElement.getContext("2d");
}

export function measureText(text: string, style: MeasureStyle): MeasuredDimensions {
  const fontSize = style.fontSize ?? DEFAULT_WTB_FONT_SIZE;
  const fontFamily = style.fontFamily ?? "sans-serif";
  const fontWeight = style.fontWeight ?? "400";
  const lineHeightMultiplier = style.lineHeight ?? 1.2;
  const maxWidth = style.maxWidth ?? 300;

  const ctx = getCanvasContext();
  if (!ctx) {
    // SSR fallback — rough estimate only
    const estimatedLines = text.split("\n");
    return {
      width: Math.min(maxWidth, text.length * fontSize * 0.6),
      height: estimatedLines.length * fontSize * lineHeightMultiplier,
      lines: estimatedLines,
    };
  }

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // Split into paragraphs by newline, then wrap words
  const paragraphs = text.split("\n");
  const finalLines: string[] = [];

  for (const para of paragraphs) {
    if (para.trim() === "") {
      finalLines.push("");
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidth && currentLine) {
        finalLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      finalLines.push(currentLine);
    }
  }

  let maxLineWidth = 0;
  for (const line of finalLines) {
    if (line) {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    }
  }

  const computedHeight = finalLines.length * fontSize * lineHeightMultiplier;

  return {
    width: Math.ceil(maxLineWidth),
    height: Math.ceil(computedHeight),
    lines: finalLines,
  };
}
