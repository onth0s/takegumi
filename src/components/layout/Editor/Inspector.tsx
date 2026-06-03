"use client";

import { useState } from "react";
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

type ProjectTab = "controls" | "styling";

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
  const [projectTab, setProjectTab] = useState<ProjectTab>("controls");

  const title = inspectorTitle(selectedBlockId, selectedGroupId, selectedPanelId);
  const isProjectView = project && !selectedPanelId && !selectedGroupId && !selectedBlockId;

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
  } else if (project && isProjectView) {
    content =
      projectTab === "controls" ? (
        <ProjectInspector project={project} />
      ) : (
        <div className="text-text-tertiary">Global Styling coming soon</div>
      );
  }

  return (
    <div className="w-1/4 border-l border-border-subtle bg-surface-elevated text-text-secondary text-sm flex flex-col min-h-0">
      <div className="flex px-4 h-14 items-center font-medium text-text-primary text-sm bg-surface border-b border-border-subtle shrink-0">
        {title}
      </div>
      {isProjectView && (
        <div className="flex border-b border-border-subtle shrink-0">
          <button
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors border-b-2 ${
              projectTab === "controls"
                ? "text-text-primary border-accent"
                : "text-text-tertiary border-transparent hover:text-text-secondary"
            }`}
            onClick={() => setProjectTab("controls")}
          >
            Project Controls
          </button>
          <button
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors border-b-2 ${
              projectTab === "styling"
                ? "text-text-primary border-accent"
                : "text-text-tertiary border-transparent hover:text-text-secondary"
            }`}
            onClick={() => setProjectTab("styling")}
          >
            Global Styling
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">{content}</div>
    </div>
  );
}
