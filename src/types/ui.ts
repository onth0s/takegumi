/** @planned Selection, context menu, and guide state for the editor shell (misc/PLAN.md Phase 4). */

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

export type SidebarTab = "inspector" | "assets" | "script" | "history";
