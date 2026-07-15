import type { WTextGroup, WProject } from "@/types/canvas";
import { SmartSlider, ScrubInput } from "@/components/shared/UI";
import { wtgWidthToPercent, wtgPercentToWidth, CANVAS_MAX_WIDTH } from "@/constants/layout";
import { DEFAULT_WTG_WIDTH, DEFAULT_WTG_HEIGHT } from "@/constants/canvasDefaults";
import { snapGroupWidth, snapGroupHeight } from "@/utils/snapMath";
import { InspectorSection, InspectorToggle } from "../InspectorFields";

interface Props {
  group: WTextGroup;
  mutateGroup: (recipe: (g: WTextGroup) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
  project: WProject | null;
}

export function TGDimensionsSection({ group, mutateGroup, endContinuous, project }: Props) {
  const widthVal = group.style.width ?? DEFAULT_WTG_WIDTH;
  const freeWidth = group.style.freeWidth ?? false;
  const heightVal = group.style.height ?? DEFAULT_WTG_HEIGHT;
  const freeHeight = group.style.freeHeight ?? false;

  return (
    <InspectorSection title="Dimensions">
      <div className="flex flex-col gap-3">
        <SmartSlider
          label={wtgWidthToPercent(widthVal) === 0 ? "Width: Tight" : `Width: ${wtgWidthToPercent(widthVal)}%`}
          value={wtgWidthToPercent(widthVal)}
          min={0}
          max={100}
          step={1}
          fineStep={1}
          ctrlSteps={[0, 10, 25, 50, 75, 100]}
          onChange={(v) => mutateGroup((g) => {
            const rawPx = wtgPercentToWidth(v);
            const oldW = g.style.width ?? DEFAULT_WTG_WIDTH;
            const leftEdge = g.x - oldW / 2;
            const rightEdge = g.x + oldW / 2;

            const wasLeftAligned = Math.abs(leftEdge) <= 2;
            const wasRightAligned = Math.abs(rightEdge - CANVAS_MAX_WIDTH) <= 2;
            const wasCentered = Math.abs(g.x - CANVAS_MAX_WIDTH / 2) <= 2;

            const gridSize = project?.grid?.size ?? 1;
            const effectiveGridSize = (wasLeftAligned || wasRightAligned) ? gridSize : gridSize * 2;
            const snappedPx = snapGroupWidth(rawPx, effectiveGridSize, project?.grid?.snapEnabled ?? false, g.style.freeWidth);
            const newW = snappedPx;

            if (wasLeftAligned) {
              g.x = newW / 2;
            } else if (wasRightAligned) {
              g.x = CANVAS_MAX_WIDTH - newW / 2;
            } else if (wasCentered) {
              g.x = CANVAS_MAX_WIDTH / 2;
            } else {
              let nextX = g.x;
              if (nextX - newW / 2 < 0) {
                nextX = newW / 2;
              } else if (nextX + newW / 2 > CANVAS_MAX_WIDTH) {
                nextX = CANVAS_MAX_WIDTH - newW / 2;
              }
              g.x = nextX;
            }

            g.style.width = snappedPx;
          }, "continuous")}
          onCommit={endContinuous}
        />
        {project?.grid?.snapEnabled && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary">Free Width</span>
            <InspectorToggle
              checked={freeWidth}
              onChange={(checked) =>
                mutateGroup((g) => {
                  g.style.freeWidth = checked || undefined;
                  if (!checked && project.grid.snapEnabled) {
                    const oldW = g.style.width ?? DEFAULT_WTG_WIDTH;

                    const leftEdge = g.x - oldW / 2;
                    const rightEdge = g.x + oldW / 2;
                    const wasLeftAligned = Math.abs(leftEdge) <= 2;
                    const wasRightAligned = Math.abs(rightEdge - CANVAS_MAX_WIDTH) <= 2;
                    const wasCentered = Math.abs(g.x - CANVAS_MAX_WIDTH / 2) <= 2;

                    const gridSize = project.grid.size;
                    const effectiveGridSize = (wasLeftAligned || wasRightAligned) ? gridSize : gridSize * 2;
                    const snappedPx = snapGroupWidth(oldW, effectiveGridSize, true, false);

                    if (wasLeftAligned) {
                      g.x = snappedPx / 2;
                    } else if (wasRightAligned) {
                      g.x = CANVAS_MAX_WIDTH - snappedPx / 2;
                    } else if (wasCentered) {
                      g.x = CANVAS_MAX_WIDTH / 2;
                    } else {
                      let nextX = g.x;
                      if (nextX - snappedPx / 2 < 0) {
                        nextX = snappedPx / 2;
                      } else if (nextX + snappedPx / 2 > CANVAS_MAX_WIDTH) {
                        nextX = CANVAS_MAX_WIDTH - snappedPx / 2;
                      }
                      g.x = nextX;
                    }

                    g.style.width = snappedPx;
                  }
                })
              }
            />
          </div>
        )}
        <ScrubInput
          label="Height"
          value={heightVal}
          step={project?.grid?.snapEnabled && !freeHeight ? ((project?.grid?.size ?? 1) * 2) : 1}
          fineStep={1}
          min={0}
          max={600}
          suffix={heightVal === 0 ? " (Tight)" : "px"}
          onChange={(v) => mutateGroup((g) => {
            const effectiveGridSize = (project?.grid?.size ?? 1) * 2;
            const snappedPx = snapGroupHeight(v, effectiveGridSize, project?.grid?.snapEnabled ?? false, g.style.freeHeight);
            g.style.height = snappedPx;
          }, "continuous")}
          onCommit={endContinuous}
        />
        {project?.grid?.snapEnabled && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary">Free Height</span>
            <InspectorToggle
              checked={freeHeight}
              onChange={(checked) =>
                mutateGroup((g) => {
                  g.style.freeHeight = checked || undefined;
                  if (!checked && project.grid.snapEnabled) {
                    const effectiveGridSize = project.grid.size * 2;
                    g.style.height = snapGroupHeight(g.style.height ?? DEFAULT_WTG_HEIGHT, effectiveGridSize, true, false);
                  }
                })
              }
            />
          </div>
        )}
      </div>
    </InspectorSection>
  );
}
