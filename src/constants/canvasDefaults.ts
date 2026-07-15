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
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_WIDTH,
  DEFAULT_WTG_HEIGHT,
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_BORDER_COLOR,
  DEFAULT_WTG_BORDER_OPACITY,
  DEFAULT_WTG_SHAPE_TYPE,
  DEFAULT_WTG_BORDER_MODE,
  DEFAULT_WTB_FONT_SIZE,
  DEFAULT_WTB_FONT_WEIGHT,
  DEFAULT_WTB_COLOR,
  DEFAULT_WTB_TEXT_ALIGN,
  DEFAULT_WTB_OPACITY,
  DEFAULT_WTB_BACKGROUND_OPACITY,
} from "./_yaml-defaults.generated";

import { CANVAS_MAX_WIDTH } from "./layout";

// ─── WTextGroup backdrop padding (useWPath) ───────────────────────────────────

export const BACKDROP_PAD_X = 24;
export const BACKDROP_PAD_Y = 16;

// ─── Local image blob URLs ────────────────────────────────────────────────────

export const LOCAL_IMAGE_PREFIX = "local://";

// ─── Panel dimensions ─────────────────────────────────────────────────────────

export const DEFAULT_PANEL_WIDTH = CANVAS_MAX_WIDTH / 2;
export const DEFAULT_PANEL_HEIGHT = 480;
/** Reference width for imported images — same as default panel width. */
export const IMPORT_PANEL_WIDTH = CANVAS_MAX_WIDTH / 2;

// ─── Snap threshold ───────────────────────────────────────────────────────────

/** Proximity threshold for snap-to-grid (clamped at runtime to gridSize / 2). */
export const SNAP_PROXIMITY_THRESHOLD = 4;
