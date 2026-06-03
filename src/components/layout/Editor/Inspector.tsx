"use client";

import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import {
  findPanel,
  findTextBlock,
  findTextGroup,
} from "@/utils/findInProject";
import { EmptyInspectorState } from "./inspector/InspectorFields";
import PanelInspector from "./inspector/PanelInspector";
import ProjectInspector from "./inspector/ProjectInspector";
import TextBlockInspector from "./inspector/TextBlockInspector";
import TextGroupInspector from "./inspector/TextGroupInspector";

function inspectorTitle(
  selectedBlockId: string | null,
  selectedGroupId: string | null,
  selectedPanelId: string | null
): string {
  if (selectedBlockId) return "Text Block";
  if (selectedGroupId) return "Text Group";
  if (selectedPanelId) return "Panel";
  return "Project";
}

export default function Inspector() {
  const project = useProjectStore((s) => s.project);
  const selectedPanelId = useUIStore((s) => s.selectedWPanelId);
  const selectedGroupId = useUIStore((s) => s.selectedWTextGroupId);
  const selectedBlockId = useUIStore((s) => s.selectedWTextBlockId);

  const title = inspectorTitle(selectedBlockId, selectedGroupId, selectedPanelId);

  let content = <EmptyInspectorState />;

  if (project && selectedBlockId && selectedGroupId && selectedPanelId) {
    const block = findTextBlock(project, selectedPanelId, selectedGroupId, selectedBlockId);
    if (block) {
      content = (
        <TextBlockInspector panelId={selectedPanelId} groupId={selectedGroupId} block={block} />
      );
    }
  } else if (project && selectedGroupId && selectedPanelId) {
    const group = findTextGroup(project, selectedPanelId, selectedGroupId);
    if (group) {
      content = <TextGroupInspector panelId={selectedPanelId} group={group} />;
    }
  } else if (project && selectedPanelId) {
    const panel = findPanel(project, selectedPanelId);
    if (panel) {
      content = <PanelInspector panel={panel} />;
    }
  } else if (project) {
    content = <ProjectInspector project={project} />;
  }

  return (
    <div className="w-1/4 border-l border-border-subtle bg-surface-elevated text-text-secondary text-sm flex flex-col min-h-0">
      <div className="flex px-4 h-14 items-center font-medium text-text-primary text-sm bg-surface border-b border-border-subtle shrink-0">
        {title}
      </div>
      <div className="flex-1 overflow-y-auto p-4">{content}</div>
    </div>
  );
}
