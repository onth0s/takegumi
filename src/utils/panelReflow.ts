import type { WProject } from "@/types/canvas";

/**
 * Shifts all panels below the specified panel, as well as the specified panel's
 * own text groups, by deltaY pixels.
 */
export function shiftPanelsBelow(draft: WProject, fromPanelId: string, deltaY: number): void {
  if (deltaY === 0) return;

  const fromPanel = draft.panels.find((p) => p.id === fromPanelId);
  if (!fromPanel) return;

  // 1. Shift text groups of the active panel
  fromPanel.textGroups.forEach((group) => {
    group.y += deltaY;
    if (group.tailAnchor) {
      group.tailAnchor.y += deltaY;
    }
  });

  // 2. Shift all panels below it and their text groups
  const targetIndex = draft.panels.findIndex((p) => p.id === fromPanelId);
  if (targetIndex !== -1) {
    for (let i = targetIndex + 1; i < draft.panels.length; i++) {
      const p = draft.panels[i];
      p.y += deltaY;
      p.textGroups.forEach((group) => {
        group.y += deltaY;
        if (group.tailAnchor) {
          group.tailAnchor.y += deltaY;
        }
      });
    }
  }
}
