"use client";

import { useState, lazy, Suspense } from "react";
import { useProjectStore, selectPanelCount, selectGroupCount, selectBlockCount } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import type { ProjectInspectorTab } from "@/types/ui";
import {
  findPanel,
  findTextBlock,
  findTextGroup,
} from "@/utils/findInProject";

import { SegmentedControl } from "@/components/shared/UI";
import { EmptyInspectorState, InspectorSection } from "./inspector/InspectorFields";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

const PanelInspector = lazy(() => import("./inspector/PanelInspector"));
const ProjectInspector = lazy(() => import("./inspector/ProjectInspector"));
const TextBlockInspector = lazy(() => import("./inspector/TextBlockInspector"));
const TextGroupInspector = lazy(() => import("./inspector/TextGroupInspector"));

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
  const panelCount = useProjectStore(selectPanelCount);
  const groupCount = useProjectStore(selectGroupCount);
  const blockCount = useProjectStore(selectBlockCount);

  const selectedPanelId = useUIStore((s) => s.selectedWPanelId);
  const selectedGroupId = useUIStore((s) => s.selectedWTextGroupId);
  const selectedBlockId = useUIStore((s) => s.selectedWTextBlockId);
  const [projectTab, setProjectTab] = useState<ProjectInspectorTab>("canvas");

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
    } else {
      content = (
        <div className="flex flex-col gap-6">
          <InspectorSection title="Project Info">
            <div className="text-xs space-y-1 text-text-tertiary">
              <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
              <p>Last edited: {new Date(project.updatedAt).toLocaleDateString()}</p>
              <p>Panels: {panelCount}</p>
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
            onChange={(v) => setProjectTab(v as ProjectInspectorTab)}
            options={[
              { value: "canvas", label: "Canvas" },
              { value: "info", label: "Info" },
            ]}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        <ErrorBoundary fallback={<div className="text-xs text-danger">Inspector Error</div>}>
          <Suspense fallback={<div className="text-xs text-text-tertiary">Loading...</div>}>
            {content}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
