// ─── WTextBlock ───────────────────────────────────────────────────────────────

export interface WTextBlockStyle {
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  fontFamily?: string;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  opacity?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
}

export interface WTextBlock {
  id: string;
  text: string;
  style: WTextBlockStyle;
}

// ─── WTextGroup ───────────────────────────────────────────────────────────────

export interface WTextGroupStyle {
  opacity?: number;
  backgroundColor?: string;
  width?: number;
  freeWidth?: boolean;
  height?: number;
  freeHeight?: boolean;
  freeX?: boolean;
  freeY?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderOpacity?: number;
  shapeType?: "rect" | "pill" | "rounded-rectangle" | "action-burst";
  /** How this WTG interacts with the panel's synthetic border. */
  borderMode?: "overlap" | "union";
  fontFamily?: string;
}

export interface WTextGroup {
  id: string;
  x: number;
  y: number;
  style: WTextGroupStyle;
  tailAnchor: { x: number; y: number } | null;
  /** @planned Reserved for tracking which specific block within the group the tail anchors to. */
  tailAnchorBlockId?: string | null;
  blocks: WTextBlock[];
}

// ─── WPanel ───────────────────────────────────────────────────────────────────

export interface WPanelStyle {
  /** When true, the X position is not rounded to the grid even if grid snap is on. */
  freeX?: boolean;
  /** When true, the Y position is not rounded to the grid even if grid snap is on. */
  freeY?: boolean;
  /** When true, the Width is not rounded to the grid even if grid snap is on. */
  freeWidth?: boolean;
}

export interface WPanel {
  id: string;
  imageUrl: string | null;
  /** Canvas-absolute X coordinate in pixels. */
  x: number;
  /** Canvas-absolute Y coordinate in pixels. */
  y: number;
  width: number;
  height: number;
  textGroups: WTextGroup[];
  style?: WPanelStyle;
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number;
  disableSyntheticBorder: boolean;
  zIndex?: number;
}

// ─── Grid & Theme ──────────────────────────────────────────────────────────────

export type CanvasTheme = "light" | "dark";

export interface WProjectGrid {
  /** Grid cell size in pixels. */
  size: number;
  /** Master toggle for snap-to-grid. */
  snapEnabled: boolean;
  /** Show/hide the grid overlay. */
  showGrid: boolean;
}

// ─── WProject ─────────────────────────────────────────────────────────────────

export interface WProject {
  id: string;
  name: string;
  panels: WPanel[];
  grid: WProjectGrid;
  canvasTheme: CanvasTheme;
  createdAt: string;
  updatedAt: string;
  disableSyntheticBorder: boolean;
}

