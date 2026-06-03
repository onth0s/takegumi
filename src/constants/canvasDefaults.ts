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

// ─── Snap threshold ───────────────────────────────────────────────────────────

/** Proximity threshold for snap-to-grid (clamped at runtime to gridSize / 2). */
export const SNAP_PROXIMITY_THRESHOLD = 4;
