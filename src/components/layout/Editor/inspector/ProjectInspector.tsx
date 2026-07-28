"use client";

import { useCallback } from "react";
import type { WProject, CanvasTheme } from "@/types/canvas";
import {
  DEFAULT_PANEL_WIDTH,
  DEFAULT_PANEL_HEIGHT,
} from "@/constants/canvasDefaults";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { SegmentedControl, ToggleSwitch } from "@/components/shared/UI";
import {
  FieldRow,
  FieldRowHorizontal,
  InspectorInput,
  InspectorSection,
  InspectorButton,
} from "./InspectorFields";

interface Props {
  project: WProject;
}

export default function ProjectInspector({ project }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const hideAllText = useUIStore((s) => s.hideAllText);
  const setHideAllText = useUIStore((s) => s.setHideAllText);

  const endContinuous = useCallback(() => {
    useProjectStore.getState().endContinuousCommit();
  }, []);

  const handleExport = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, "-")}-project.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [project]);

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
            checked={hideAllText} 
            onChange={setHideAllText} 
          />
        </FieldRowHorizontal>
        <FieldRowHorizontal label="Disable Synthetic Border">
          <ToggleSwitch 
            checked={!!project.disableSyntheticBorder} 
            onChange={(v) => updateProject((draft) => { draft.disableSyntheticBorder = v; })} 
          />
        </FieldRowHorizontal>
      </InspectorSection>

      <InspectorSection title="Defaults" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-surface border border-border-subtle flex flex-col gap-0.5">
            <span className="text-text-tertiary">Default Width</span>
            <span className="text-text-primary font-medium">{DEFAULT_PANEL_WIDTH}px</span>
          </div>
          <div className="p-2 rounded bg-surface border border-border-subtle flex flex-col gap-0.5">
            <span className="text-text-tertiary">Default Height</span>
            <span className="text-text-primary font-medium">{DEFAULT_PANEL_HEIGHT}px</span>
          </div>
        </div>
        <p className="text-xs text-text-tertiary">Default dimensions for new panels, derived from canvas.yaml SSOT.</p>
      </InspectorSection>

      <InspectorSection title="Actions">
        <InspectorButton onClick={handleExport}>Export project JSON</InspectorButton>
      </InspectorSection>
    </div>
  );
}
