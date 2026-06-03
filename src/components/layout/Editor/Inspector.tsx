"use client";

import { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import {
  findPanel,
  findTextBlock,
  findTextGroup,
} from "@/utils/findInProject";
import {
  DEFAULT_PANEL_WIDTH,
  DEFAULT_PANEL_HEIGHT,
} from "@/constants/canvasDefaults";
import { SegmentedControl, ScrubInput } from "@/components/shared/UI";
import { EmptyInspectorState, InspectorSection } from "./inspector/InspectorFields";
import PanelInspector from "./inspector/PanelInspector";
import ProjectInspector from "./inspector/ProjectInspector";
import TextBlockInspector from "./inspector/TextBlockInspector";
import TextGroupInspector from "./inspector/TextGroupInspector";

type ProjectTab = "canvas" | "defaults" | "info";

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
  const [projectTab, setProjectTab] = useState<ProjectTab>("canvas");

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
    if (projectTab === "canvas") {
      content = <ProjectInspector project={project} />;
    } else if (projectTab === "defaults") {
      content = (
        <div className="flex flex-col gap-6">
          <InspectorSection title="Panel Defaults">
            <div className="grid grid-cols-2 gap-2">
              <ScrubInput label="Width" value={DEFAULT_PANEL_WIDTH} step={1} fineStep={1} min={50} max={2048} suffix="px"
                onChange={() => {}} onCommit={() => {}}
              />
              <ScrubInput label="Height" value={DEFAULT_PANEL_HEIGHT} step={1} fineStep={1} min={50} max={2048} suffix="px"
                onChange={() => {}} onCommit={() => {}}
              />
            </div>
            <p className="text-xs text-text-tertiary">Default dimensions for new panels. Edit in canvasDefaults.ts</p>
          </InspectorSection>
        </div>
      );
    } else {
      const groupCount = project.panels.reduce((sum, p) => sum + p.textGroups.length, 0);
      const blockCount = project.panels.reduce(
        (sum, p) => sum + p.textGroups.reduce((s, g) => s + g.blocks.length, 0),
        0
      );
      content = (
        <div className="flex flex-col gap-6">
          <InspectorSection title="Project Info">
            <div className="text-xs space-y-1 text-text-tertiary">
              <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
              <p>Last edited: {new Date(project.updatedAt).toLocaleDateString()}</p>
              <p>Panels: {project.panels.length}</p>
              <p>Text groups: {groupCount}</p>
              <p>Text blocks: {blockCount}</p>
            </div>
          </InspectorSection>
        </div>
      );
    }
  }

  return (
    <div className="w-1/4 border-l border-border-subtle bg-surface-elevated text-text-secondary text-sm flex flex-col min-h-0">
      <div className="flex px-4 h-14 items-center font-medium text-text-primary text-sm bg-surface border-b border-border-subtle shrink-0">
        {title}
      </div>
      {isProjectView && (
        <div className="px-3 py-2 border-b border-border-subtle shrink-0">
          <SegmentedControl
            value={projectTab}
            onChange={(v) => setProjectTab(v as ProjectTab)}
            options={[
              { value: "canvas", label: "Canvas" },
              { value: "defaults", label: "Defaults" },
              { value: "info", label: "Info" },
            ]}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">{content}</div>
    </div>
  );
}
