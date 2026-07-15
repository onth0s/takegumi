import { useState, useLayoutEffect, RefObject } from "react";
import type { WPanel } from "@/types/canvas";
import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
import {
  discretizeRect,
  discretizeRoundedRect,
  discretizeActionBurst,
  discretizeTail,
  unionTwoPolygons,
  polygonToSVGPath,
  Point,
} from "@/utils/polygonUnion";
import {
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_SHAPE_TYPE,
  DEFAULT_WTG_BORDER_MODE,
} from "@/constants/canvasDefaults";
import { getGroupLocalRect } from "@/utils/groupGeometry";

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
        const intersects =
          localRect.left < panel.width &&
          localRect.right > 0 &&
          localRect.top < panel.height &&
          localRect.bottom > 0;
        if (intersects) {
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
      return;
    }

    const computePath = () => {
      const panelEl = panelRef.current;
      if (!panelEl) return;

      const pWidth = panel.width;
      const pHeight = panel.height;
      const bw = borderWidth;

      const hasAnyUnion = panel.textGroups.some(
        (g) => (g.style.borderMode ?? DEFAULT_WTG_BORDER_MODE) === "union"
      );
      if (hasAnyUnion && !hideAllText) {
        const offset = bw / 2;
        let currentUnionPolys: Point[][] = [discretizeRect(-offset, -offset, pWidth + bw, pHeight + bw)];

        panel.textGroups.forEach((group) => {
          const groupBorderMode = group.style.borderMode ?? DEFAULT_WTG_BORDER_MODE;
          if (groupBorderMode !== "union") return;

          const groupRect = useUIStore.getState().textGroupRects.get(group.id);
          if (!groupRect) return;
          const localRect = getGroupLocalRect(group, panel.x, panel.y, groupRect.width, groupRect.height);
          const gLeft = localRect.left;
          const gTop = localRect.top;
          const gWidth = localRect.width;
          const gHeight = localRect.height;

          const shape = group.style.shapeType ?? DEFAULT_WTG_SHAPE_TYPE;
          const r = group.style.borderRadius ?? DEFAULT_WTG_BORDER_RADIUS;

          let bubblePoly: Point[] = [];
          if (shape === "pill") {
            bubblePoly = discretizeRoundedRect(
              gLeft - offset,
              gTop - offset,
              gWidth + 2 * offset,
              gHeight + 2 * offset,
              gHeight / 2 + offset
            );
          } else if (shape === "action-burst") {
            bubblePoly = discretizeActionBurst(
              gLeft - offset,
              gTop - offset,
              gWidth + 2 * offset,
              gHeight + 2 * offset
            );
          } else if (shape === "rect") {
            bubblePoly = discretizeRect(
              gLeft - offset,
              gTop - offset,
              gWidth + 2 * offset,
              gHeight + 2 * offset
            );
          } else {
            bubblePoly = discretizeRoundedRect(
              gLeft - offset,
              gTop - offset,
              gWidth + 2 * offset,
              gHeight + 2 * offset,
              r + offset
            );
          }

          const nextLoops: Point[][] = [];
          let merged = false;
          for (const poly of currentUnionPolys) {
            const unionResult = unionTwoPolygons(poly, bubblePoly);
            if (unionResult.length === 1) {
              nextLoops.push(unionResult[0]);
              merged = true;
            } else {
              nextLoops.push(poly);
            }
          }
          if (merged) {
            currentUnionPolys = nextLoops;
          }

          if (group.tailAnchor) {
            const relativeAnchorX = group.tailAnchor.x - (group.x - gWidth / 2);
            const relativeAnchorY = group.tailAnchor.y - (group.y - gHeight / 2);
            const tailPoly = discretizeTail(gWidth, gHeight, relativeAnchorX, relativeAnchorY, gLeft, gTop);

            const nextLoopsWithTail: Point[][] = [];
            let tailMerged = false;
            for (const poly of currentUnionPolys) {
              const unionResult = unionTwoPolygons(poly, tailPoly);
              if (unionResult.length === 1) {
                nextLoopsWithTail.push(unionResult[0]);
                tailMerged = true;
              } else {
                nextLoopsWithTail.push(poly);
              }
            }
            if (tailMerged) {
              currentUnionPolys = nextLoopsWithTail;
            }
          }
        });

        const d = currentUnionPolys.map(poly => polygonToSVGPath(poly)).join(" ");
        setPathD(d);
        computeMaskRects();
        return;
      }

      const half = bw / 2;
      const d = `M ${-half},${-half} H ${pWidth + half} V ${pHeight + half} H ${-half} Z`;
      setPathD(d);
      computeMaskRects();
    };

    function computeMaskRects() {
      if (hideAllText) {
        setMaskRects([]);
        return;
      }
      const rects: { x: number; y: number; w: number; h: number }[] = [];
      const allTextGroups = project?.panels.flatMap((p) =>
        p.textGroups.map((g) => ({ ...g, panelId: p.id }))
      ) ?? [];

      allTextGroups.forEach((group) => {
        const groupBorderMode = group.style.borderMode ?? DEFAULT_WTG_BORDER_MODE;
        const isOwnUnion = group.panelId === panel.id && groupBorderMode === "union";
        if (isOwnUnion) return;

        const groupRect = useUIStore.getState().textGroupRects.get(group.id);
        if (!groupRect) return;
        const localRect = getGroupLocalRect(group, panel.x, panel.y, groupRect.width, groupRect.height);

        const intersects =
          localRect.left < panel.width &&
          localRect.right > 0 &&
          localRect.top < panel.height &&
          localRect.bottom > 0;

        if (intersects) {
          rects.push({
            x: localRect.left,
            y: localRect.top,
            w: localRect.width,
            h: localRect.height,
          });
        }
      });
      setMaskRects(rects);
    }

    computePath();

    const observer = new ResizeObserver(() => {
      computePath();
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
