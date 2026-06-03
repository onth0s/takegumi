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

/** @deprecated Playback transitions — not implemented until Remotion export (misc/PLAN.md). */
export interface WTextBlockTransition {
  in?: { type: "fade" | "slide" | "scale"; duration: number };
  out?: { type: "fade" | "slide" | "scale"; duration: number };
}

export interface WTextBlock {
  id: string;
  text: string;
  style: WTextBlockStyle;
  /** @deprecated See {@link WTextBlockTransition}. */
  transition?: WTextBlockTransition;
}

// ─── WTextGroup ───────────────────────────────────────────────────────────────

export interface WTextGroupStyle {
  opacity?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  shapeType?: "pill" | "rounded-rectangle" | "action-burst" | "rect";
}

export interface WTextGroup {
  id: string;
  x: number;
  y: number;
  style: WTextGroupStyle;
  tailAnchor: { x: number; y: number } | null;
  tailAnchorBlockId?: string | null;
  blocks: WTextBlock[];
}

// ─── WPanel ───────────────────────────────────────────────────────────────────

export interface WPanelStyle {
  gutter?: number;
  borderStyle?: string;
}

export interface WPanel {
  id: string;
  imageUrl: string | null;
  /** @planned Absolute layout — flex layout used today; coordinates reserved for future engine. */
  x: number;
  /** @planned Absolute layout — flex layout used today; coordinates reserved for future engine. */
  y: number;
  width: number;
  height: number;
  textGroups: WTextGroup[];
  style?: WPanelStyle;
}

// ─── WProject ─────────────────────────────────────────────────────────────────

export interface WProject {
  id: string;
  name: string;
  panels: WPanel[];
  createdAt: string;
  updatedAt: string;
}
