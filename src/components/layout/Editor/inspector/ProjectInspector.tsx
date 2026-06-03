"use client";

import { useCallback } from "react";
import type { WProject, CanvasTheme } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import {
  FieldRow,
  FieldRowHorizontal,
  InspectorInput,
  InspectorSection,
  InspectorSelect,
  InspectorToggle,
} from "./InspectorFields";

interface Props {
  project: WProject;
}

export default function ProjectInspector({ project }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateProject((draft) => {
        draft.name = e.target.value;
      }, "continuous");
    },
    [updateProject]
  );

  const handleShowGridChange = useCallback(
    (v: boolean) => {
      updateProject((draft) => {
        draft.grid.showGrid = v;
      }, "continuous");
    },
    [updateProject]
  );

  const handleSnapEnabledChange = useCallback(
    (v: boolean) => {
      updateProject((draft) => {
        draft.grid.snapEnabled = v;
      }, "continuous");
    },
    [updateProject]
  );

  const handleGridSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(2, Math.min(100, Number(e.target.value) || 2));
      updateProject((draft) => {
        draft.grid.size = v;
      }, "continuous");
    },
    [updateProject]
  );

  const handleThemeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateProject((draft) => {
        draft.canvasTheme = e.target.value as CanvasTheme;
      }, "continuous");
    },
    [updateProject]
  );

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Project">
        <FieldRow label="Name">
          <InspectorInput
            type="text"
            value={project.name}
            onChange={handleNameChange}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Grid">
        <FieldRowHorizontal label="Show Grid">
          <InspectorToggle
            checked={project.grid.showGrid}
            onChange={handleShowGridChange}
          />
        </FieldRowHorizontal>

        <FieldRowHorizontal label="Snap to Grid">
          <InspectorToggle
            checked={project.grid.snapEnabled}
            onChange={handleSnapEnabledChange}
          />
        </FieldRowHorizontal>

        <FieldRow label="Size (px)">
          <InspectorInput
            type="number"
            min={2}
            max={100}
            value={project.grid.size}
            onChange={handleGridSizeChange}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>

        <FieldRow label="Canvas Theme">
          <InspectorSelect value={project.canvasTheme} onChange={handleThemeChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </InspectorSelect>
        </FieldRow>
      </InspectorSection>
    </div>
  );
}
