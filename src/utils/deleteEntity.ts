import type { WProject } from "@/types/canvas";

export interface DeleteResult {
  deletedId: string;
  type: "block" | "group" | "panel";
}

/**
 * Mutates the draft project to delete the active selected entity in place.
 * Returns information about what was deleted, or null if nothing was deleted.
 */
export function deleteSelectedEntity(
  draft: WProject,
  selectedPanelId: string | null,
  selectedGroupId: string | null,
  selectedBlockId: string | null
): DeleteResult | null {
  if (selectedBlockId && selectedGroupId && selectedPanelId) {
    const panel = draft.panels.find((p) => p.id === selectedPanelId);
    const group = panel?.textGroups.find((g) => g.id === selectedGroupId);
    if (group && group.blocks.length > 1) {
      group.blocks = group.blocks.filter((b) => b.id !== selectedBlockId);
      return { deletedId: selectedBlockId, type: "block" };
    }
  } else if (selectedGroupId && selectedPanelId) {
    const panel = draft.panels.find((p) => p.id === selectedPanelId);
    if (panel) {
      panel.textGroups = panel.textGroups.filter((g) => g.id !== selectedGroupId);
      return { deletedId: selectedGroupId, type: "group" };
    }
  } else if (selectedPanelId) {
    draft.panels = draft.panels.filter((p) => p.id !== selectedPanelId);
    return { deletedId: selectedPanelId, type: "panel" };
  }
  return null;
}

/**
 * Returns true if the block can be deleted (i.e. parent group has more than 1 block).
 */
export function canDeleteBlock(group?: { blocks: unknown[] } | null): boolean {
  return (group?.blocks.length ?? 0) > 1;
}
