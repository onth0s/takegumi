import { useMemo } from "react";
import { useProjectStore } from "@/stores/projectStore";
import {
  snapValue,
  snapRect,
  effectiveSnapThreshold,
  type Rect,
} from "@/utils/snapMath";
import { SNAP_PROXIMITY_THRESHOLD } from "@/constants/canvasDefaults";

export interface UseSnappingResult {
  snapValue: (v: number) => number;
  snapRect: (rect: Rect) => Rect;
  gridSize: number;
  snapEnabled: boolean;
  showGrid: boolean;
  effectiveThreshold: number;
}

export function useSnapping(): UseSnappingResult {
  const grid = useProjectStore((s) => s.project?.grid);

  return useMemo(() => {
    const gs = grid?.size ?? 10;
    const enabled = grid?.snapEnabled ?? true;
    const show = grid?.showGrid ?? true;
    const threshold = effectiveSnapThreshold(SNAP_PROXIMITY_THRESHOLD, gs);

    if (!enabled) {
      return {
        snapValue: (v) => v,
        snapRect: (r) => r,
        gridSize: gs,
        snapEnabled: false,
        showGrid: show,
        effectiveThreshold: threshold,
      };
    }

    return {
      snapValue: (v) => snapValue(v, gs),
      snapRect: (r) => snapRect(r, gs),
      gridSize: gs,
      snapEnabled: true,
      showGrid: show,
      effectiveThreshold: threshold,
    };
  }, [grid?.size, grid?.snapEnabled, grid?.showGrid]);
}
