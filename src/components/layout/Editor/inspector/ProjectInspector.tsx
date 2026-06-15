"use client";

import { memo, useCallback } from "react";
import type { WProject, CanvasTheme } from "@/types/canvas";
import {
  DEFAULT_PANEL_WIDTH,
  DEFAULT_PANEL_HEIGHT,
} from "@/constants/canvasDefaults";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { ScrubInput, SegmentedControl, ToggleSwitch } from "@/components/shared/UI";
import {
  FieldRow,
  FieldRowHorizontal,
  InspectorInput,
  InspectorSection,
} from "./InspectorFields";

interface Props {
  project: WProject;
}

export default memo(function ProjectInspector({ project }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);

  const endContinuous = () => useProjectStore.getState().endContinuousCommit();

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
      }, "ignore");
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
    (v: string) => {
      updateProject((draft) => {
        draft.canvasTheme = v as CanvasTheme;
      }, "discrete");
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
            onBlur={endContinuous}
          />
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Grid">
        <FieldRowHorizontal label="Show Grid">
          <ToggleSwitch checked={project.grid.showGrid} onChange={handleShowGridChange} />
        </FieldRowHorizontal>
        <FieldRowHorizontal label="Snap to Grid">
          <ToggleSwitch checked={project.grid.snapEnabled} onChange={handleSnapEnabledChange} />
        </FieldRowHorizontal>
        <FieldRow label="Size (px)">
          <InspectorInput
            type="number"
            min={2}
            max={100}
            value={project.grid.size}
            onChange={handleGridSizeChange}
            onBlur={endContinuous}
          />
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Canvas">
        <SegmentedControl label="Theme"
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
          value={project.canvasTheme}
          onChange={handleThemeChange}
        />
        <FieldRowHorizontal label="Hide All Text">
          <ToggleSwitch 
            checked={useUIStore((s) => s.hideAllText)} 
            onChange={(v) => useUIStore.getState().setHideAllText(v)} 
          />
        </FieldRowHorizontal>
      </InspectorSection>

      <InspectorSection title="Defaults" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <ScrubInput label="Panel width" value={DEFAULT_PANEL_WIDTH} step={1} fineStep={1} min={50} max={2048} suffix="px"
            onChange={() => {}}
            onCommit={() => {}}
          />
          <ScrubInput label="Panel height" value={DEFAULT_PANEL_HEIGHT} step={1} fineStep={1} min={50} max={2048} suffix="px"
            onChange={() => {}}
            onCommit={() => {}}
          />
        </div>
        <p className="text-xs text-text-tertiary">Default dimensions for new panels. Edit in canvasDefaults.ts</p>
      </InspectorSection>
    </div>
  );
});
