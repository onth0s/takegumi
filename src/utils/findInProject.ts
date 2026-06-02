import type { WPanel, WProject, WTextBlock, WTextGroup } from "@/types/canvas";

export function findPanel(project: WProject, panelId: string): WPanel | undefined {
  return project.panels.find((p) => p.id === panelId);
}

export function findTextGroup(
  project: WProject,
  panelId: string,
  groupId: string
): WTextGroup | undefined {
  const panel = findPanel(project, panelId);
  return panel?.textGroups.find((g) => g.id === groupId);
}

export function findTextBlock(
  project: WProject,
  panelId: string,
  groupId: string,
  blockId: string
): WTextBlock | undefined {
  const group = findTextGroup(project, panelId, groupId);
  return group?.blocks.find((b) => b.id === blockId);
}

export function findPanelIdForGroup(project: WProject, groupId: string): string | null {
  for (const panel of project.panels) {
    if (panel.textGroups.some((g) => g.id === groupId)) {
      return panel.id;
    }
  }
  return null;
}
