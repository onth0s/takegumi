// ─── YAML-derived defaults (auto-generated, do not edit directly) ─────────────
export {
  DEFAULT_GRID_SIZE,
  DEFAULT_GRID_SNAP_ENABLED,
  DEFAULT_GRID_SHOW_GRID,
  DEFAULT_CANVAS_THEME,
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_SHAPE_TYPE,
  DEFAULT_WTB_FONT_SIZE,
  DEFAULT_WTB_FONT_WEIGHT,
  DEFAULT_WTB_COLOR,
  DEFAULT_WTB_TEXT_ALIGN,
  DEFAULT_WTB_OPACITY,
  DEFAULT_WTB_BACKGROUND_OPACITY,
} from "./_yaml-defaults.generated";

// ─── Panel dimensions ─────────────────────────────────────────────────────────

export const DEFAULT_PANEL_WIDTH = 640;
export const DEFAULT_PANEL_HEIGHT = 480;
/** Reference width for imported images — 50% of {@link DEFAULT_PANEL_WIDTH}. */
export const IMPORT_PANEL_WIDTH = 320;

// ─── WTextGroup backdrop padding (useWPath) ───────────────────────────────────

export const BACKDROP_PAD_X = 24;
export const BACKDROP_PAD_Y = 16;

// ─── Local image blob URLs ────────────────────────────────────────────────────

export const LOCAL_IMAGE_PREFIX = "local://";

// ─── Canvas / viewport dimensions ─────────────────────────────────────────────

/** Max width of the canvas content area (`max-w-[960px]` in CSS). */
export const CANVAS_MAX_WIDTH = 960;
/** Padding inside the canvas area (`p-[40px]` in CSS). */
export const CANVAS_PADDING = 40;
/** Default padding from parent edges for text groups. */
export const GROUP_PADDING = 20;

// ─── Panel position helpers ───────────────────────────────────────────────────

/** Clamp a value to [min, max]. */
function valClamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Convert a panel's x-offset (from the content-area left edge, in px) to a 0-100
 * percentage. 0 % means flush with the content-area left edge, 100 % flush with
 * the right edge.
 */
export function xToPanelPercent(x: number, panelWidth: number): number {
  const contentWidth = CANVAS_MAX_WIDTH - 2 * CANVAS_PADDING;
  const maxX = contentWidth - panelWidth;
  if (maxX <= 0) return 50;
  return Math.round(valClamp((x / maxX) * 100, 0, 100));
}

/**
 * Convert a 0-100 percentage to a pixel x-offset from the content-area left edge.
 */
export function percentToPanelX(percent: number, panelWidth: number): number {
  const contentWidth = CANVAS_MAX_WIDTH - 2 * CANVAS_PADDING;
  const maxX = contentWidth - panelWidth;
  return Math.round(valClamp((percent / 100) * maxX, 0, contentWidth));
}

/**
 * Compute the default horizontal position (%) for a new panel based on existing panels.
 * Single panel → 50%. Otherwise, alternate toward the opposite side of the previous
 * panel ±10% so panels don't sit exactly on the same edge.
 */
export function computeDefaultPanelPercent(existingPanels: { x: number; width: number }[]): number {
  if (existingPanels.length === 0) return 50;

  const prev = existingPanels[existingPanels.length - 1];
  const prevPercent = xToPanelPercent(prev.x, prev.width);

  if (Math.abs(prevPercent - 50) < 1) return 50;
  if (prevPercent < 50) return Math.min(100, Math.round(prevPercent + 10));
  return Math.max(0, Math.round(prevPercent - 10));
}

// ─── Snap threshold ───────────────────────────────────────────────────────────

/** Proximity threshold for snap-to-grid (clamped at runtime to gridSize / 2). */
export const SNAP_PROXIMITY_THRESHOLD = 4;
