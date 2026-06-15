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

// ─── Panel dimensions ─────────────────────────────────────────────────────────

export const DEFAULT_PANEL_WIDTH = CANVAS_MAX_WIDTH / 2;
export const DEFAULT_PANEL_HEIGHT = 480;
/** Reference width for imported images — same as default panel width. */
export const IMPORT_PANEL_WIDTH = CANVAS_MAX_WIDTH / 2;

// ─── Panel position helpers ───────────────────────────────────────────────────

/** Clamp a value to [min, max]. */
function valClamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Convert a panel's x-offset (from the canvas left edge, in px) to a 0-100
 * percentage. 0 % means flush with the left edge, 100 % flush with the right edge.
 */
export function xToPanelPercent(x: number, panelWidth: number): number {
  const maxX = CANVAS_MAX_WIDTH - panelWidth;
  if (maxX <= 0) return 50;
  return Math.round(valClamp((x / maxX) * 100, 0, 100));
}

/**
 * Convert a 0-100 percentage to a pixel x-offset from the canvas left edge.
 */
export function percentToPanelX(percent: number, panelWidth: number): number {
  const maxX = CANVAS_MAX_WIDTH - panelWidth;
  return Math.round(valClamp((percent / 100) * maxX, 0, CANVAS_MAX_WIDTH));
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

// ─── Panel width helpers ───────────────────────────────────────────────────────

/** Minimum panel width as a percentage of canvas width. */
export const MIN_PANEL_WIDTH_PERCENT = 10;

export function widthToPercent(px: number): number {
  return Math.round(valClamp((px / CANVAS_MAX_WIDTH) * 100, MIN_PANEL_WIDTH_PERCENT, 100));
}

export function percentToWidth(percent: number): number {
  return Math.round(valClamp((percent / 100) * CANVAS_MAX_WIDTH, (MIN_PANEL_WIDTH_PERCENT / 100) * CANVAS_MAX_WIDTH, CANVAS_MAX_WIDTH));
}

// ─── Snap threshold ───────────────────────────────────────────────────────────

/** Proximity threshold for snap-to-grid (clamped at runtime to gridSize / 2). */
export const SNAP_PROXIMITY_THRESHOLD = 4;

// ─── Panel Y snap helper ───────────────────────────────────────────────────────

/**
 * Snap a raw Y value to the nearest grid multiple.
 *
 * Returns `Math.round(y)` unchanged when:
 * - `snapEnabled` is false (global snap off), or
 * - `freeY` is true (per-panel override).
 *
 * Otherwise rounds to the nearest `gridSize` multiple.
 */
export function snapY(
  y: number,
  gridSize: number,
  snapEnabled: boolean,
  freeY: boolean | undefined,
): number {
  if (!snapEnabled || freeY) return Math.round(y);
  return Math.round(y / gridSize) * gridSize;
}

// ─── Panel Width snap helper ──────────────────────────────────────────────────

/**
 * Snap a raw pixel width to the nearest grid multiple,
 * clamped to [minWidth, CANVAS_MAX_WIDTH].
 *
 * The slider operates in percentage space while the grid is in pixel space, so
 * snapping must be applied to the pixel value after `percentToWidth` converts it.
 *
 * Returns a clamped `Math.round(width)` unchanged when:
 * - `snapEnabled` is false (global snap off), or
 * - `freeWidth` is true (per-panel override).
 *
 * Otherwise rounds to the nearest `gridSize` multiple, then re-clamps.
 */
export function snapWidth(
  width: number,
  gridSize: number,
  snapEnabled: boolean,
  freeWidth: boolean | undefined,
): number {
  const minWidth = (MIN_PANEL_WIDTH_PERCENT / 100) * CANVAS_MAX_WIDTH;
  if (!snapEnabled || freeWidth) {
    return Math.round(Math.min(CANVAS_MAX_WIDTH, Math.max(minWidth, width)));
  }
  const snapped = Math.round(width / gridSize) * gridSize;
  return Math.min(CANVAS_MAX_WIDTH, Math.max(minWidth, snapped));
}
