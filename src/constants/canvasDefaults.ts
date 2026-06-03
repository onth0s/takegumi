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

// ─── Local image blob URLs ────────────────────────────────────────────────────

export const LOCAL_IMAGE_PREFIX = "local://";
