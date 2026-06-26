/**
 * @planned Transient editor UI state — wire up when Inspector, selection, and DnD land.
 * See misc/PLAN.md Phase 4 (Dual-Store Architecture).
 */
import { create } from "zustand";
import type { AlignmentGuide, ContextMenuState, SidebarTab } from "@/types/ui";

interface UIState {
  selectedWPanelId: string | null;
  selectedWTextGroupId: string | null;
  selectedWTextBlockId: string | null;

  contextMenu: ContextMenuState | null;
  activeSidebarTab: SidebarTab;

  alignmentGuides: AlignmentGuide[];

  /** Monotonically increments on every project mutation for dirty-state tracking. */
  revision: number;
  hideAllText: boolean;

  setSelectedPanelId: (id: string | null) => void;
  setSelectedTextGroupId: (id: string | null) => void;
  setSelectedTextBlockId: (id: string | null) => void;

  setContextMenu: (menu: ContextMenuState | null) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  setHideAllText: (hide: boolean) => void;
  clearSelection: () => void;

  selectPanel: (id: string) => void;
  selectTextGroup: (panelId: string, groupId: string) => void;
  selectTextBlock: (panelId: string, groupId: string, blockId: string) => void;

  incrementRevision: () => void;
  resetRevision: () => void;

  textGroupRects: Map<string, DOMRect>;
  setTextGroupRect: (groupId: string, rect: DOMRect | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedWPanelId: null,
  selectedWTextGroupId: null,
  selectedWTextBlockId: null,
  contextMenu: null,
  activeSidebarTab: "inspector",
  alignmentGuides: [],
  revision: 0,
  hideAllText: false,

  setSelectedPanelId: (id) => set({ selectedWPanelId: id }),
  setSelectedTextGroupId: (id) => set({ selectedWTextGroupId: id }),
  setSelectedTextBlockId: (id) => set({ selectedWTextBlockId: id }),

  setContextMenu: (menu) => set({ contextMenu: menu }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setAlignmentGuides: (guides) => set({ alignmentGuides: guides }),
  setHideAllText: (hide) => set({ hideAllText: hide }),

  clearSelection: () =>
    set({
      selectedWPanelId: null,
      selectedWTextGroupId: null,
      selectedWTextBlockId: null,
    }),

  selectPanel: (id) =>
    set({
      selectedWPanelId: id,
      selectedWTextGroupId: null,
      selectedWTextBlockId: null,
    }),

  selectTextGroup: (panelId, groupId) =>
    set({
      selectedWPanelId: panelId,
      selectedWTextGroupId: groupId,
      selectedWTextBlockId: null,
    }),

  selectTextBlock: (panelId, groupId, blockId) =>
    set({
      selectedWPanelId: panelId,
      selectedWTextGroupId: groupId,
      selectedWTextBlockId: blockId,
    }),

  incrementRevision: () => set((state) => ({ revision: state.revision + 1 })),
  resetRevision: () => set({ revision: 0 }),

  textGroupRects: new Map<string, DOMRect>(),
  setTextGroupRect: (groupId, rect) =>
    set((state) => {
      const nextMap = new Map(state.textGroupRects);
      if (rect) {
        nextMap.set(groupId, rect);
      } else {
        nextMap.delete(groupId);
      }
      return { textGroupRects: nextMap };
    }),
}));
