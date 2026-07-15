import type { WPanel, WProjectGrid } from "@/types/canvas";
import { SmartSlider } from "@/components/shared/UI";
import { widthToPercent, percentToWidth, percentToPanelX, CANVAS_MAX_WIDTH } from "@/constants/layout";
import { snapWidth, snapX } from "@/utils/snapMath";
import { InspectorSection, InspectorToggle } from "../InspectorFields";

interface Props {
  panel: WPanel;
  mutatePanel: (recipe: (p: WPanel) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
  grid?: WProjectGrid;
}

export function PanelDimensionsSection({ panel, mutatePanel, endContinuous, grid }: Props) {
  const freeWidth = panel.style?.freeWidth ?? false;

  return (
    <InspectorSection title="Dimensions">
      <div className="flex flex-col gap-3">
        <SmartSlider label={`Width: ${widthToPercent(panel.width)}%`} value={widthToPercent(panel.width)} min={10} max={100} step={1} fineStep={1}
          ctrlSteps={[10, 25, 50, 75, 100]}
          onChange={(v) => mutatePanel((p) => {
            const rawWidth = percentToWidth(v);
            const oldWidth = p.width;
            
            const maxX = CANVAS_MAX_WIDTH - oldWidth;
            const percent = maxX > 0 ? (p.x / maxX) * 100 : 50;
            const isCentered = Math.abs(percent - 50) <= 2;
            
            const bw = p.borderEnabled ? p.borderWidth : 0;
            const effectiveGridSize = isCentered ? (grid?.size ?? 1) * 2 : (grid?.size ?? 1);
            const newWidth = snapWidth(rawWidth, effectiveGridSize, grid?.snapEnabled ?? false, p.style?.freeWidth, bw);
            
            // Scale height proportionally to maintain aspect ratio
            if (oldWidth > 0) {
              p.height = Math.round(p.height * (newWidth / oldWidth));
            }

            if (percent <= 2) {
              p.x = 0;
            } else if (percent >= 98) {
              p.x = CANVAS_MAX_WIDTH - newWidth;
            } else if (isCentered) {
              p.x = percentToPanelX(50, newWidth);
            } else {
              const center = p.x + oldWidth / 2;
              let nextX = center - newWidth / 2;
              if (grid?.snapEnabled && !p.style?.freeX) {
                nextX = snapX(nextX, grid.size, true, false, bw);
              } else {
                nextX = Math.round(nextX);
              }
              p.x = nextX;
            }
            p.width = newWidth;
          }, "continuous")}
          onCommit={endContinuous}
        />
        {grid?.snapEnabled && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary">Free Width</span>
            <InspectorToggle
              checked={freeWidth}
              onChange={(checked) =>
                mutatePanel((p) => {
                  p.style = { ...p.style, freeWidth: checked || undefined };
                  if (!checked && grid.snapEnabled) {
                    const oldWidth = p.width;
                    const maxX = CANVAS_MAX_WIDTH - oldWidth;
                    const pct = maxX > 0 ? (p.x / maxX) * 100 : 50;
                    const isCentered = Math.abs(pct - 50) <= 2;
                    const bw = p.borderEnabled ? p.borderWidth : 0;
                    const effectiveGridSize = isCentered ? grid.size * 2 : grid.size;
                    const snapped = snapWidth(oldWidth, effectiveGridSize, true, false, bw);
                    
                    // Scale height proportionally to maintain aspect ratio
                    if (oldWidth > 0 && snapped !== oldWidth) {
                      p.height = Math.round(p.height * (snapped / oldWidth));
                    }

                    if (pct <= 2) p.x = 0;
                    else if (pct >= 98) p.x = CANVAS_MAX_WIDTH - snapped;
                    else if (isCentered) p.x = percentToPanelX(50, snapped);
                    else {
                      let nextX = p.x + oldWidth / 2 - snapped / 2;
                      if (grid.snapEnabled && !p.style?.freeX) {
                        nextX = snapX(nextX, grid.size, true, false, bw);
                      } else {
                        nextX = Math.round(nextX);
                      }
                      p.x = nextX;
                    }
                    p.width = snapped;
                  }
                })
              }
            />
          </div>
        )}
      </div>
      <p className="text-xs text-text-tertiary mt-2">
        {panel.textGroups.length} text group{panel.textGroups.length !== 1 ? "s" : ""}
      </p>
    </InspectorSection>
  );
}
