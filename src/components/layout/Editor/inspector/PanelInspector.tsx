"use client";

import { memo, useCallback } from "react";
import type { WPanel } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createTextGroup } from "@/utils/createProject";
import { deletePanelImage } from "@/utils/panelImageStorage";
import { findPanel } from "@/utils/findInProject";
import { CANVAS_MAX_WIDTH, CANVAS_PADDING } from "@/constants/canvasDefaults";
import { ScrubInput } from "@/components/shared/UI";
import {
  InspectorButton,
  InspectorSection,
  AlignmentControl,
} from "./InspectorFields";

interface Props {
  panel: WPanel;
}

export default memo(function PanelInspector({ panel }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const clearSelection = useUIStore((s) => s.clearSelection);

  const mutatePanel = useCallback(
    (recipe: (p: WPanel) => void, commitType: "discrete" | "continuous" = "discrete") => {
      updateProject(
        (draft) => {
          const p = findPanel(draft, panel.id);
          if (p) recipe(p);
        },
        commitType,
        panel.id
      );
    },
    [updateProject, panel.id]
  );

  const handleDelete = useCallback(() => {
    updateProject(
      (draft) => {
        draft.panels = draft.panels.filter((p) => p.id !== panel.id);
      },
      "discrete",
      panel.id
    );
    deletePanelImage(panel.id).catch((err) => {
      console.error("Failed to delete image for panel", panel.id, err);
    });
    clearSelection();
  }, [updateProject, panel.id, clearSelection]);

  const handleAddTextGroup = useCallback(() => {
    mutatePanel((p) => {
      p.textGroups.push(createTextGroup(p.width / 2, p.height / 2));
    });
  }, [mutatePanel]);

  const endContinuous = () => useProjectStore.getState().endContinuousCommit();

  const gutter = panel.style?.gutter;
  const borderStyle = panel.style?.borderStyle;
  const hasImage = panel.imageUrl !== null;
  const effectiveWidth = CANVAS_MAX_WIDTH - 2 * CANVAS_PADDING;

  const handleAlign = useCallback(
    (dir: "left" | "center" | "right") => {
      mutatePanel((p) => {
        if (dir === "left") p.x = CANVAS_PADDING;
        else if (dir === "center") p.x = Math.round((effectiveWidth - p.width) / 2) + CANVAS_PADDING;
        else p.x = effectiveWidth - p.width + CANVAS_PADDING;
      });
    },
    [mutatePanel, effectiveWidth]
  );

  const snapOffsets = {
    left: CANVAS_PADDING,
    center: Math.round((effectiveWidth - panel.width) / 2) + CANVAS_PADDING,
    right: effectiveWidth - panel.width + CANVAS_PADDING,
  };
  const currentAlign: "left" | "center" | "right" =
    Math.abs(panel.x - snapOffsets.left) <= 2 ? "left" :
    Math.abs(panel.x - snapOffsets.center) <= 2 ? "center" :
    Math.abs(panel.x - snapOffsets.right) <= 2 ? "right" : "center";

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Position">
        <div className="grid grid-cols-2 gap-2">
          <ScrubInput label="X" value={Math.round(panel.x)} step={1} fineStep={1} min={0} max={9999} suffix="px"
            onChange={(v) => mutatePanel((p) => { p.x = v; }, "continuous")}
            onCommit={endContinuous}
          />
          <ScrubInput label="Y" value={Math.round(panel.y)} step={1} fineStep={1} min={0} max={9999} suffix="px"
            onChange={(v) => mutatePanel((p) => { p.y = v; }, "continuous")}
            onCommit={endContinuous}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">Align</span>
          <AlignmentControl value={currentAlign} onChange={handleAlign} />
        </div>
      </InspectorSection>

      <InspectorSection title="Dimensions">
        <div className="grid grid-cols-2 gap-2">
          <ScrubInput label="Width" value={panel.width} step={1} fineStep={1} min={50} max={2048} suffix="px"
            onChange={(v) => mutatePanel((p) => { p.width = v; }, "continuous")}
            onCommit={endContinuous}
          />
          <ScrubInput label="Height" value={panel.height} step={1} fineStep={1} min={50} max={2048} suffix="px"
            onChange={(v) => mutatePanel((p) => { p.height = v; }, "continuous")}
            onCommit={endContinuous}
          />
        </div>
        {gutter !== undefined && (
          <ScrubInput label="Gutter" value={gutter} step={1} fineStep={1} min={0} max={100} suffix="px"
            onChange={(v) => mutatePanel((p) => { p.style = { ...p.style, gutter: v }; }, "continuous")}
            onCommit={endContinuous}
          />
        )}
        <p className="text-xs text-text-tertiary">
          {panel.textGroups.length} text group{panel.textGroups.length !== 1 ? "s" : ""}
        </p>
      </InspectorSection>

      <InspectorSection title="Image">
        {hasImage ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-tertiary truncate" title={panel.imageUrl!}>
              {panel.imageUrl!.length > 30 ? panel.imageUrl!.slice(0, 30) + "…" : panel.imageUrl}
            </span>
            <button
              type="button"
              onClick={() => {
                mutatePanel((p) => { p.imageUrl = null; });
                deletePanelImage(panel.id).catch(() => {});
              }}
              className="text-xs text-danger hover:text-danger/80 shrink-0"
            >
              Clear
            </button>
          </div>
        ) : (
          <span className="text-xs text-text-tertiary">No image</span>
        )}
      </InspectorSection>

      <InspectorSection title="Actions">
        <InspectorButton onClick={handleAddTextGroup}>Add text group</InspectorButton>
        <InspectorButton variant="danger" onClick={handleDelete} className="mt-2">
          Delete panel
        </InspectorButton>
      </InspectorSection>
    </div>
  );
});
