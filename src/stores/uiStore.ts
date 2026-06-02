import { create } from "zustand";

interface ContextMenuState {
  x: number;
  y: number;
  type: "panel" | "canvas" | "text-group" | "text-block";
  targetId: string;
}

interface AlignmentGuide {
  direction: "vertical" | "horizontal";
  coordinate: number;
}

interface UIState {
  selectedWPanelId: string | null;
  selectedWTextGroupId: string | null;
  selectedWTextBlockId: string | null;
  
  contextMenu: ContextMenuState | null;
  activeSidebarTab: "inspector" | "assets" | "script" | "history";
  
  // Snap guidelines for grid/alignment visual guides
  alignmentGuides: AlignmentGuide[];

  // Actions
  setSelectedPanelId: (id: string | null) => void;
  setSelectedTextGroupId: (id: string | null) => void;
  setSelectedTextBlockId: (id: string | null) => void;
  
  setContextMenu: (menu: ContextMenuState | null) => void;
  setActiveSidebarTab: (tab: "inspector" | "assets" | "script" | "history") => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  clearSelection: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedWPanelId: null,
  selectedWTextGroupId: null,
  selectedWTextBlockId: null,
  contextMenu: null,
  activeSidebarTab: "inspector",
  alignmentGuides: [],

  setSelectedPanelId: (id) => set({ selectedWPanelId: id }),
  setSelectedTextGroupId: (id) => set({ selectedWTextGroupId: id }),
  setSelectedTextBlockId: (id) => set({ selectedWTextBlockId: id }),
  
  setContextMenu: (menu) => set({ contextMenu: menu }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setAlignmentGuides: (guides) => set({ alignmentGuides: guides }),
  
  clearSelection: () => set({
    selectedWPanelId: null,
    selectedWTextGroupId: null,
    selectedWTextBlockId: null,
  }),
}));
