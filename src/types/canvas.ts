export interface WTextBlock {
  id: string;
  text: string;
  style: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
    lineHeight?: number;
    textAlign?: "left" | "center" | "right";
  };
  transition?: Record<string, any>;
}

export interface WTextGroupStyle {
  opacity?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  shapeType?: "pill" | "rounded-rectangle" | "action-burst";
}

export interface WTextGroup {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: WTextGroupStyle;
  tailAnchor: { x: number; y: number } | null;
  blocks: WTextBlock[];
}

export interface WPanel {
  id: string;
  imageUrl: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  textGroups: WTextGroup[];
  style?: Record<string, any>;
}

export interface WProject {
  id: string;
  name: string;
  panels: WPanel[];
  createdAt: string;
  updatedAt: string;
}
