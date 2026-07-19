import { useState, useLayoutEffect, RefObject } from "react";
import type { WPanel } from "@/types/canvas";
import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
import { getGroupLocalRect } from "@/utils/groupGeometry";
import { rectsOverlap } from "@/utils/geometry";
import { computeUnionPath, computeBorderMaskRects } from "@/utils/borderUnion";

interface UseWBorderProps {
  panel: WPanel;
  panelRef: RefObject<HTMLElement | null>;
  disableSyntheticBorderGlobal?: boolean;
}

interface UseWBorderResult {
  pathD: string;
  borderColor: string;
  borderWidth: number;
  enabled: boolean;
  maskRects: { x: number; y: number; w: number; h: number }[];
}

export function useWBorder({
  panel,
  panelRef,
  disableSyntheticBorderGlobal = false,
}: UseWBorderProps): UseWBorderResult {
  const [pathD, setPathD] = useState("");
  const [maskRects, setMaskRects] = useState<{ x: number; y: number; w: number; h: number }[]>([]);

  const hideAllText = useUIStore((s) => s.hideAllText);
  const project = useProjectStore((s) => s.project);

  // Selectively subscribe to only the text group rects that actually intersect or belong to this panel
  const relevantRectsHash = useUIStore((s) => {
    const ownIds = panel.textGroups.map((g) => g.id);
    let hash = "";
    s.textGroupRects.forEach((rect, id) => {
      const isOwn = ownIds.includes(id);
      if (isOwn) {
        hash += `${id}:${rect.width},${rect.height};`;
        return;
      }
      let group = null;
      if (project) {
        for (const p of project.panels) {
          const g = p.textGroups.find((x) => x.id === id);
          if (g) {
            group = g;
            break;
          }
        }
      }
      if (group) {
        const localRect = getGroupLocalRect(group, panel.x, panel.y, rect.width, rect.height);
        if (rectsOverlap(localRect, panel.width, panel.height)) {
          hash += `${id}:${rect.width},${rect.height};`;
        }
      }
    });
    return hash;
  });

  const enabled =
    panel.borderEnabled &&
    !panel.disableSyntheticBorder &&
    !disableSyntheticBorderGlobal;

  const borderWidth = panel.borderWidth;
  const borderColor = panel.borderColor;

  useLayoutEffect(() => {
    if (!enabled || !panelRef.current) {
      setPathD("");
      setMaskRects([]);
      return;
    }

    const computePathAndMasks = () => {
      const panelEl = panelRef.current;
      if (!panelEl) return;

      const rects = useUIStore.getState().textGroupRects;
      const allPanels = project?.panels ?? [];

      const unionPath = computeUnionPath(panel, rects, borderWidth, hideAllText);
      setPathD(unionPath);

      const masks = computeBorderMaskRects(panel, allPanels, rects, hideAllText);
      setMaskRects(masks);
    };

    computePathAndMasks();

    const observer = new ResizeObserver(() => {
      computePathAndMasks();
    });
    observer.observe(panelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, panel, borderWidth, borderColor, hideAllText, relevantRectsHash, panelRef, project]);

  return {
    pathD,
    borderColor,
    borderWidth,
    enabled,
    maskRects,
  };
}
