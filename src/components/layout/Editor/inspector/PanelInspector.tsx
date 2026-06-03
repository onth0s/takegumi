"use client";

import { memo, useCallback } from "react";
import type { WPanel } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createTextGroup } from "@/utils/createProject";
import { deletePanelImage } from "@/utils/panelImageStorage";
import { findPanel } from "@/utils/findInProject";
import { CANVAS_MAX_WIDTH, xToPanelPercent, percentToPanelX, widthToPercent, percentToWidth } from "@/constants/canvasDefaults";
import { ScrubInput, SmartSlider } from "@/components/shared/UI";
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
  const hasImage = panel.imageUrl !== null;
  const panelPercent = xToPanelPercent(panel.x, panel.width);

  const handleAlign = useCallback(
    (dir: "left" | "center" | "right") => {
      mutatePanel((p) => {
        const percent = dir === "left" ? 0 : dir === "center" ? 50 : 100;
        p.x = percentToPanelX(percent, p.width);
      });
    },
    [mutatePanel]
  );

  const currentAlign: "left" | "center" | "right" =
    panelPercent <= 2 ? "left" :
    panelPercent >= 98 ? "right" : "center";

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Position">
        <div className="flex flex-col gap-3">
          <SmartSlider label={`Position: ${panelPercent}%`} value={panelPercent} min={0} max={100} step={1} fineStep={1}
            ctrlSteps={[0, 25, 50, 75, 100]}
            onChange={(v) => mutatePanel((p) => { p.x = percentToPanelX(v, p.width); }, "continuous")}
            onCommit={endContinuous}
          />
          <ScrubInput label="Y" value={Math.round(panel.y)} step={1} fineStep={1} min={-9999} max={9999} suffix="px"
            onChange={(v) => mutatePanel((p) => { p.y = Math.round(v); }, "continuous")}
            onCommit={endContinuous}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary">Align</span>
            <AlignmentControl value={currentAlign} onChange={handleAlign} />
          </div>
        </div>
      </InspectorSection>

      <InspectorSection title="Dimensions">
        <div className="flex flex-col gap-3">
          <SmartSlider label={`Width: ${widthToPercent(panel.width)}%`} value={widthToPercent(panel.width)} min={10} max={100} step={1} fineStep={1}
            ctrlSteps={[10, 25, 50, 75, 100]}
            onChange={(v) => mutatePanel((p) => {
              const newWidth = percentToWidth(v);
              const oldWidth = p.width;
              const maxX = CANVAS_MAX_WIDTH - oldWidth;
              const percent = maxX > 0 ? (p.x / maxX) * 100 : 50;
              if (percent <= 2) {
                p.x = 0;
              } else if (percent >= 98) {
                p.x = CANVAS_MAX_WIDTH - newWidth;
              } else {
                const center = p.x + oldWidth / 2;
                p.x = Math.round(center - newWidth / 2);
              }
              p.width = newWidth;
            }, "continuous")}
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
