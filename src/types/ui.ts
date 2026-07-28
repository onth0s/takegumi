/** Selection, context menu, and guide state for the editor shell. */

export interface ContextMenuState {
  x: number;
  y: number;
  type: "panel" | "canvas" | "text-group" | "text-block";
  targetId: string;
}

export interface AlignmentGuide {
  direction: "vertical" | "horizontal";
  coordinate: number;
}

/** @planned "history" reserved for planned history panel tab */
export type SidebarTab = "inspector" | "history";

export type ProjectInspectorTab = "canvas" | "info";
