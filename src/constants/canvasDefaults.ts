// ─── YAML-derived defaults (auto-generated, do not edit directly) ─────────────
export {
  DEFAULT_GRID_SIZE,
  DEFAULT_GRID_SNAP_ENABLED,
  DEFAULT_GRID_SHOW_GRID,
  DEFAULT_CANVAS_THEME,
  DEFAULT_PROJECT_DISABLE_SYNTHETIC_BORDER,
  DEFAULT_PANEL_BORDER_ENABLED,
  DEFAULT_PANEL_BORDER_COLOR,
  DEFAULT_PANEL_BORDER_WIDTH,
  DEFAULT_PANEL_DISABLE_SYNTHETIC_BORDER,
  DEFAULT_PANEL_BORDER_MODE,
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_WIDTH,
  DEFAULT_WTG_HEIGHT,
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_BORDER_COLOR,
  DEFAULT_WTG_BORDER_OPACITY,
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

// ─── Panel X snap helper ───────────────────────────────────────────────────────

/**
 * Snap a raw X value to the nearest grid multiple.
 *
 * Returns `Math.round(x)` unchanged when:
 * - `snapEnabled` is false (global snap off), or
 * - `freeX` is true (per-panel override).
 *
 * Otherwise rounds to the nearest `gridSize` multiple.
 */
export function snapX(
  x: number,
  gridSize: number,
  snapEnabled: boolean,
  freeX: boolean | undefined,
  borderWidth: number = 0,
): number {
  if (!snapEnabled || freeX) return Math.round(x);
  const target = x + borderWidth;
  const snappedTarget = Math.round(target / gridSize) * gridSize;
  return snappedTarget - borderWidth;
}

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
  borderWidth: number = 0,
): number {
  if (!snapEnabled || freeY) return Math.round(y);
  const target = y + borderWidth;
  const snappedTarget = Math.round(target / gridSize) * gridSize;
  return snappedTarget - borderWidth;
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
  borderWidth: number = 0,
): number {
  const minWidth = (MIN_PANEL_WIDTH_PERCENT / 100) * CANVAS_MAX_WIDTH;
  if (!snapEnabled || freeWidth) {
    return Math.round(Math.min(CANVAS_MAX_WIDTH, Math.max(minWidth, width)));
  }
  const innerWidth = width - 2 * borderWidth;
  const snappedInner = Math.round(innerWidth / gridSize) * gridSize;
  const snapped = snappedInner + 2 * borderWidth;
  return Math.min(CANVAS_MAX_WIDTH, Math.max(minWidth, snapped));
}

export function wtgWidthToPercent(px: number): number {
  if (px === 0) return 0;
  return Math.round(valClamp((px / CANVAS_MAX_WIDTH) * 100, 1, 100));
}

export function wtgPercentToWidth(percent: number): number {
  if (percent === 0) return 0;
  return Math.round(valClamp((percent / 100) * CANVAS_MAX_WIDTH, 1, CANVAS_MAX_WIDTH));
}

export function snapGroupWidth(
  width: number,
  gridSize: number,
  snapEnabled: boolean,
  freeWidth: boolean | undefined,
): number {
  if (width === 0) return 0;
  if (!snapEnabled || freeWidth) {
    return Math.round(valClamp(width, 1, CANVAS_MAX_WIDTH));
  }
  const snapped = Math.round(width / gridSize) * gridSize;
  return Math.round(valClamp(snapped, gridSize, CANVAS_MAX_WIDTH));
}

export const WTG_MAX_HEIGHT = 600;

export function wtgHeightToPercent(px: number): number {
  if (px === 0) return 0;
  return Math.round(valClamp((px / WTG_MAX_HEIGHT) * 100, 1, 100));
}

export function wtgPercentToHeight(percent: number): number {
  if (percent === 0) return 0;
  return Math.round(valClamp((percent / 100) * WTG_MAX_HEIGHT, 1, WTG_MAX_HEIGHT));
}

export function snapGroupHeight(
  height: number,
  gridSize: number,
  snapEnabled: boolean,
  freeHeight: boolean | undefined,
): number {
  if (height === 0) return 0;
  if (!snapEnabled || freeHeight) {
    return Math.round(valClamp(height, 1, WTG_MAX_HEIGHT));
  }
  const snapped = Math.round(height / gridSize) * gridSize;
  return Math.round(valClamp(snapped, gridSize, WTG_MAX_HEIGHT));
}
