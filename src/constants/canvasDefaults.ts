import type { WTextGroupStyle } from "@/types/canvas";

// ─── Panel dimensions ─────────────────────────────────────────────────────────

export const DEFAULT_PANEL_WIDTH = 640;
export const DEFAULT_PANEL_HEIGHT = 480;
/** Reference width for imported images — 50% of {@link DEFAULT_PANEL_WIDTH}. */
export const IMPORT_PANEL_WIDTH = 320;

// ─── WTextGroup backdrop padding (useWPath) ───────────────────────────────────

export const BACKDROP_PAD_X = 24;
export const BACKDROP_PAD_Y = 16;

// ─── WTextGroup style defaults ────────────────────────────────────────────────

export const DEFAULT_WTG_BACKGROUND_COLOR = "#000000";
export const DEFAULT_WTG_OPACITY = 0.5;
export const DEFAULT_WTG_BORDER_RADIUS = 8;
export const DEFAULT_WTG_BORDER_WIDTH = 0;
export const DEFAULT_WTG_SHAPE_TYPE: NonNullable<WTextGroupStyle["shapeType"]> =
  "rounded-rectangle";

// ─── WTextBlock style defaults ────────────────────────────────────────────────

export const DEFAULT_WTB_FONT_SIZE = 24;
export const DEFAULT_WTB_FONT_WEIGHT = "700";
export const DEFAULT_WTB_COLOR = "#ffffff";
export const DEFAULT_WTB_TEXT_ALIGN = "center" as const;
export const DEFAULT_WTB_OPACITY = 1;
export const DEFAULT_WTB_BACKGROUND_OPACITY = 1;

// ─── Grid & theme ──────────────────────────────────────────────────────────────

/** Default grid cell size in pixels. */
export const DEFAULT_GRID_SIZE = 10;
/** Master toggle for snap-to-grid. */
export const DEFAULT_GRID_SNAP_ENABLED = true;
/** Show/hide the grid overlay by default. */
export const DEFAULT_GRID_SHOW_GRID = true;
/** Proximity threshold for snap-to-grid (clamped at runtime to gridSize / 2). */
export const SNAP_PROXIMITY_THRESHOLD = 4;
/** Default canvas theme. */
export const DEFAULT_CANVAS_THEME = "light";

// ─── Local image blob URLs ────────────────────────────────────────────────────

export const LOCAL_IMAGE_PREFIX = "local://";
