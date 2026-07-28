import { useCallback } from "react";
import type { WTextGroup, WProject } from "@/types/canvas";
import { ScrubInput } from "@/components/shared/UI";
import { snapX, snapY } from "@/utils/snapMath";
import { CANVAS_MAX_WIDTH } from "@/constants/layout";
import { DEFAULT_WTG_WIDTH } from "@/constants/canvasDefaults";
import { InspectorSection, InspectorToggle, AlignmentControl } from "../InspectorFields";

interface Props {
  group: WTextGroup;
  mutateGroup: (recipe: (g: WTextGroup) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
  project: WProject | null;
  cachedRect: DOMRect | null | undefined;
}

export function TGPositionSection({ group, mutateGroup, endContinuous, project, cachedRect }: Props) {
  const freeX = group.style.freeX ?? false;
  const freeY = group.style.freeY ?? false;
  const isSnappingX = (project?.grid?.snapEnabled ?? false) && !freeX;
  const isSnappingY = (project?.grid?.snapEnabled ?? false) && !freeY;

  const handleAlign = useCallback(
    (dir: "left" | "center" | "right") => {
      mutateGroup((g) => {
        const activeW = cachedRect
          ? cachedRect.width
          : typeof g.style.width === "number"
          ? g.style.width
          : DEFAULT_WTG_WIDTH;

        let targetX = 0;
        if (dir === "left") targetX = activeW / 2;
        else if (dir === "center") targetX = CANVAS_MAX_WIDTH / 2;
        else targetX = CANVAS_MAX_WIDTH - activeW / 2;

        if (project?.grid?.snapEnabled && !g.style.freeX) {
          targetX = snapX(targetX, project.grid.size, true, false);
        }
        g.x = targetX;
      }, "discrete");
    },
    [mutateGroup, project, cachedRect]
  );

  const wtgWidth = cachedRect
    ? cachedRect.width
    : typeof group.style.width === "number"
    ? group.style.width
    : DEFAULT_WTG_WIDTH;
  const alignOffsets = {
    left: wtgWidth / 2,
    center: CANVAS_MAX_WIDTH / 2,
    right: CANVAS_MAX_WIDTH - wtgWidth / 2,
  };
  const currentAlign: "left" | "center" | "right" =
    Math.abs(group.x - alignOffsets.left) <= 2 ? "left" :
    Math.abs(group.x - alignOffsets.center) <= 2 ? "center" :
    Math.abs(group.x - alignOffsets.right) <= 2 ? "right" : "center";

  return (
    <InspectorSection title="Position">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <ScrubInput label="X" value={Math.round(group.x)} step={isSnappingX ? (project?.grid?.size ?? 1) : 1} fineStep={1} min={0} max={9999} suffix="px"
            onChange={(v) => mutateGroup((g) => {
              g.x = snapX(v, project?.grid?.size ?? 1, project?.grid?.snapEnabled ?? false, g.style.freeX);
            }, "continuous")}
            onCommit={endContinuous}
          />
          <ScrubInput label="Y" value={Math.round(group.y)} step={isSnappingY ? (project?.grid?.size ?? 1) : 1} fineStep={1} min={0} max={9999} suffix="px"
            onChange={(v) => mutateGroup((g) => {
              g.y = snapY(v, project?.grid?.size ?? 1, project?.grid?.snapEnabled ?? false, g.style.freeY);
            }, "continuous")}
            onCommit={endContinuous}
          />
        </div>
        {project?.grid?.snapEnabled && (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-secondary">Free X</span>
              <InspectorToggle
                checked={freeX}
                onChange={(checked) =>
                  mutateGroup((g) => {
                    g.style.freeX = checked || undefined;
                    if (!checked && project.grid.snapEnabled) {
                      g.x = snapX(g.x, project.grid.size, true, false);
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
                  mutateGroup((g) => {
                    g.style.freeY = checked || undefined;
                    if (!checked && project.grid.snapEnabled) {
                      g.y = snapY(g.y, project.grid.size, true, false);
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
