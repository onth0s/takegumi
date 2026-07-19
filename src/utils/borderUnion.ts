import type { WPanel } from "@/types/canvas";
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
import { rectsOverlap } from "@/utils/geometry";

export function computeUnionPath(
  panel: WPanel,
  textGroupRects: Map<string, { width: number; height: number } | DOMRect>,
  bw: number,
  hideAllText = false
): string {
  const pWidth = panel.width;
  const pHeight = panel.height;

  const hasAnyUnion = panel.textGroups.some(
    (g) => (g.style.borderMode ?? DEFAULT_WTG_BORDER_MODE) === "union"
  );

  if (hasAnyUnion && !hideAllText) {
    const offset = bw / 2;
    let currentUnionPolys: Point[][] = [
      discretizeRect(-offset, -offset, pWidth + bw, pHeight + bw),
    ];

    panel.textGroups.forEach((group) => {
      const groupBorderMode = group.style.borderMode ?? DEFAULT_WTG_BORDER_MODE;
      if (groupBorderMode !== "union") return;

      const groupRect = textGroupRects.get(group.id);
      if (!groupRect) return;
      const localRect = getGroupLocalRect(
        group,
        panel.x,
        panel.y,
        groupRect.width,
        groupRect.height
      );
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
        const tailPoly = discretizeTail(
          gWidth,
          gHeight,
          relativeAnchorX,
          relativeAnchorY,
          gLeft,
          gTop
        );

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

    return currentUnionPolys.map((poly) => polygonToSVGPath(poly)).join(" ");
  }

  const half = bw / 2;
  return `M ${-half},${-half} H ${pWidth + half} V ${pHeight + half} H ${-half} Z`;
}

export function computeBorderMaskRects(
  panel: WPanel,
  allPanels: WPanel[],
  textGroupRects: Map<string, { width: number; height: number } | DOMRect>,
  hideAllText: boolean
): { x: number; y: number; w: number; h: number }[] {
  if (hideAllText) {
    return [];
  }
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  const allTextGroups = allPanels.flatMap((p) =>
    (p.textGroups ?? []).map((g) => ({ ...g, panelId: p.id }))
  );

  allTextGroups.forEach((group) => {
    const groupBorderMode = group.style.borderMode ?? DEFAULT_WTG_BORDER_MODE;
    const isOwnUnion = group.panelId === panel.id && groupBorderMode === "union";
    if (isOwnUnion) return;

    const groupRect = textGroupRects.get(group.id);
    if (!groupRect) return;
    const localRect = getGroupLocalRect(
      group,
      panel.x,
      panel.y,
      groupRect.width,
      groupRect.height
    );

    if (rectsOverlap(localRect, panel.width, panel.height)) {
      rects.push({
        x: localRect.left,
        y: localRect.top,
        w: localRect.width,
        h: localRect.height,
      });
    }
  });
  return rects;
}
