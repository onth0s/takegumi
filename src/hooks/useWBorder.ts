import { useState, useLayoutEffect, RefObject } from "react";
import type { WPanel } from "@/types/canvas";
import { useUIStore } from "@/stores/uiStore";
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
  const revision = useUIStore((s) => s.revision);
  const hideAllText = useUIStore((s) => s.hideAllText);

  const enabled =
    !!panel.borderEnabled &&
    !panel.disableSyntheticBorder &&
    !disableSyntheticBorderGlobal;

  const borderWidth = panel.borderWidth ?? 4;
  const borderColor = panel.borderColor ?? "#000000";

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
        // Panel polygon: centerline sits bw/2 OUTSIDE each edge so stroke extends
        // fully outward, inner stroke edge = panel boundary.
        let currentUnionPolys: Point[][] = [discretizeRect(-offset, -offset, pWidth + bw, pHeight + bw)];

        panel.textGroups.forEach((group) => {
          const groupBorderMode = group.style.borderMode ?? DEFAULT_WTG_BORDER_MODE;
          if (groupBorderMode !== "union") return;

          const groupEl = document.getElementById(`text-group-${group.id}`);
          if (!groupEl) return;

          const groupRect = groupEl.getBoundingClientRect();
          const gWidth = Math.round(groupRect.width);
          const gHeight = Math.round(groupRect.height);
          const gLeft = Math.round(group.x - gWidth / 2 - panel.x);
          const gTop = Math.round(group.y - gHeight / 2 - panel.y);

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
        // Mask out all WTG bounding boxes so the border never shows through them
        computeMaskRects();
        return;
      }

      // Overlap mode: closed rectangle path — centerline sits bw/2 OUTSIDE the
      // panel boundary. Stroke inner edge = panel boundary; extends fully outward.
      // Using a closed path (not 4 separate segments) ensures miter-join corners
      // identical to the polygon approach used in union mode.
      //
      // With an outward-only border, WTGs inside the panel can never reach the
      // border band, so no gap-cutting is required.
      const half = bw / 2;
      const d = `M ${-half},${-half} H ${pWidth + half} V ${pHeight + half} H ${-half} Z`;
      setPathD(d);
      // Mask out all WTG bounding boxes so the border never shows through them
      computeMaskRects();
    };

    function computeMaskRects() {
      if (hideAllText) {
        setMaskRects([]);
        return;
      }
      const rects: { x: number; y: number; w: number; h: number }[] = [];
      panel.textGroups.forEach((group) => {
        const groupEl = document.getElementById(`text-group-${group.id}`);
        if (!groupEl) return;
        const groupRect = groupEl.getBoundingClientRect();
        const gWidth = Math.round(groupRect.width);
        const gHeight = Math.round(groupRect.height);
        rects.push({
          x: Math.round(group.x - gWidth / 2 - panel.x),
          y: Math.round(group.y - gHeight / 2 - panel.y),
          w: gWidth,
          h: gHeight,
        });
      });
      setMaskRects(rects);
    }

    computePath();

    // Trigger update on resize as well
    window.addEventListener("resize", computePath);
    return () => {
      window.removeEventListener("resize", computePath);
    };
  }, [enabled, panel, borderWidth, borderColor, revision, hideAllText, panelRef]);

  return {
    pathD,
    borderColor,
    borderWidth,
    enabled,
    maskRects,
  };
}
