"use client";

import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";

export default function StatusBar() {
  const project = useProjectStore((s) => s.project);
  const selectedPanelId = useUIStore((s) => s.selectedWPanelId);
  const selectedGroupId = useUIStore((s) => s.selectedWTextGroupId);
  const selectedBlockId = useUIStore((s) => s.selectedWTextBlockId);

  const panelCount = project?.panels.length ?? 0;

  let selectionLabel = "Nothing selected";
  if (selectedBlockId) selectionLabel = "Text block";
  else if (selectedGroupId) selectionLabel = "Text group";
  else if (selectedPanelId) selectionLabel = "Panel";

  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-text-tertiary border-t border-border-subtle bg-surface-elevated">
      <span>{project?.name ?? "No project"}</span>
      <span>
        {panelCount} panel{panelCount !== 1 ? "s" : ""} · {selectionLabel}
      </span>
    </div>
  );
}
