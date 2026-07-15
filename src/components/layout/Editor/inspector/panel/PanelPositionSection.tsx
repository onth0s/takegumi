import { useCallback } from "react";
import type { WPanel, WProjectGrid, WProject } from "@/types/canvas";
import { ScrubInput, SmartSlider } from "@/components/shared/UI";
import { percentToPanelX, xToPanelPercent } from "@/constants/layout";
import { snapX, snapY, snapWidth } from "@/utils/snapMath";
import { shiftPanelsBelow } from "@/utils/panelReflow";
import {
  InspectorSection,
  InspectorToggle,
  AlignmentControl,
} from "../InspectorFields";

interface Props {
  panel: WPanel;
  mutatePanel: (recipe: (p: WPanel, draft?: WProject) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
  grid?: WProjectGrid;
}

export function PanelPositionSection({ panel, mutatePanel, endContinuous, grid }: Props) {
  const freeX = panel.style?.freeX ?? false;
  const freeY = panel.style?.freeY ?? false;
  const isSnappingX = (grid?.snapEnabled ?? false) && !freeX;
  const isSnappingY = (grid?.snapEnabled ?? false) && !freeY;
  const panelPercent = xToPanelPercent(panel.x, panel.width);

  const handleAlign = useCallback(
    (dir: "left" | "center" | "right") => {
      mutatePanel((p) => {
        const percent = dir === "left" ? 0 : dir === "center" ? 50 : 100;
        const bw = p.borderEnabled ? p.borderWidth : 0;
        if (grid?.snapEnabled && !p.style?.freeWidth) {
          const effectiveGridSize = dir === "center" ? grid.size * 2 : grid.size;
          const snapped = snapWidth(p.width, effectiveGridSize, true, false, bw);
          if (p.width > 0 && snapped !== p.width) {
            p.height = Math.round(p.height * (snapped / p.width));
            p.width = snapped;
          }
        }
        p.x = percentToPanelX(percent, p.width);
      });
    },
    [mutatePanel, grid]
  );

  const currentAlign: "left" | "center" | "right" =
    panelPercent <= 2 ? "left" :
    panelPercent >= 98 ? "right" : "center";

  return (
    <InspectorSection title="Position">
      <div className="flex flex-col gap-3">
        <SmartSlider label={`Position: ${panelPercent}%`} value={panelPercent} min={0} max={100} step={1} fineStep={1}
          ctrlSteps={[0, 25, 50, 75, 100]}
          onChange={(v) => mutatePanel((p) => {
            const rawX = percentToPanelX(v, p.width);
            const bw = p.borderEnabled ? p.borderWidth : 0;
            p.x = snapX(rawX, grid?.size ?? 1, grid?.snapEnabled ?? false, p.style?.freeX, bw);
          }, "continuous")}
          onCommit={endContinuous}
        />
        <ScrubInput label="X" value={Math.round(panel.x)} step={isSnappingX ? (grid?.size ?? 1) : 1} fineStep={1} min={-9999} max={9999} suffix="px"
          onChange={(v) => mutatePanel((p) => {
            const bw = p.borderEnabled ? p.borderWidth : 0;
            p.x = snapX(v, grid?.size ?? 1, grid?.snapEnabled ?? false, p.style?.freeX, bw);
          }, "continuous")}
          onCommit={endContinuous}
        />
        <ScrubInput label="Y" value={Math.round(panel.y)} step={isSnappingY ? (grid?.size ?? 1) : 1} fineStep={1} min={-9999} max={9999} suffix="px"
          onChange={(v) => mutatePanel((p, draft) => {
            const bw = p.borderEnabled ? p.borderWidth : 0;
            const newY = snapY(v, grid?.size ?? 1, grid?.snapEnabled ?? false, p.style?.freeY, bw);
            const deltaY = newY - p.y;
            if (deltaY !== 0 && draft) {
              shiftPanelsBelow(draft, p.id, deltaY);
            }
            p.y = newY;
          }, "continuous")}
          onCommit={endContinuous}
        />
        {grid?.snapEnabled && (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-secondary">Free X</span>
              <InspectorToggle
                checked={freeX}
                onChange={(checked) =>
                  mutatePanel((p) => {
                    p.style = { ...p.style, freeX: checked || undefined };
                    if (!checked && grid.snapEnabled) {
                      const bw = p.borderEnabled ? p.borderWidth : 0;
                      p.x = snapX(p.x, grid.size, true, false, bw);
                    }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-secondary">Free Y</span>
              <InspectorToggle
                checked={freeY}
                onChange={(checked) =>
                  mutatePanel((p, draft) => {
                    p.style = { ...p.style, freeY: checked || undefined };
                    if (!checked && grid.snapEnabled) {
                      const bw = p.borderEnabled ? p.borderWidth : 0;
                      const newY = snapY(p.y, grid.size, true, false, bw);
                      const deltaY = newY - p.y;
                      if (deltaY !== 0 && draft) {
                        shiftPanelsBelow(draft, p.id, deltaY);
                        p.y = newY;
                      }
                    }
                  })
                }
              />
            </div>
          </>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">Align</span>
          <AlignmentControl value={currentAlign} onChange={handleAlign} />
        </div>
      </div>
    </InspectorSection>
  );
}
