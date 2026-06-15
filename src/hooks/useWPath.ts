import { RefObject, useMemo } from "react";
import type { WTextGroup } from "@/types/canvas";
import {
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_SHAPE_TYPE,
} from "@/constants/canvasDefaults";
import { getBackdropPath, tailPath } from "@/utils/pathGenerators";
import { useElementDimensions } from "./useElementDimensions";

export interface WPathResult {
  backdropPath: string;
  tailPathString: string | null;
  width: number;
  height: number;
}

export function useWPath(group: WTextGroup, contentRef: RefObject<HTMLElement | null>): WPathResult {
  const blocksKey = useMemo(
    () => group.blocks.map((b) =>
      `${b.id}:${b.text}:${b.style.fontSize}:${b.style.fontWeight}:${b.style.fontFamily}:${b.style.lineHeight}`
    ).join("\0"),
    [group.blocks]
  );

  const dimensions = useElementDimensions(contentRef, [blocksKey, contentRef], 0, 0);
  const { width, height } = dimensions;
  const shape = group.style.shapeType ?? DEFAULT_WTG_SHAPE_TYPE;
  const r = group.style.borderRadius ?? DEFAULT_WTG_BORDER_RADIUS;

  const backdropPath =
    width > 0 && height > 0 ? getBackdropPath(shape, width, height, r) : "";

  let tailPathString: string | null = null;
  if (group.tailAnchor && width > 0 && height > 0) {
    const relativeAnchorX = group.tailAnchor.x - (group.x - width / 2);
    const relativeAnchorY = group.tailAnchor.y - (group.y - height / 2);
    tailPathString = tailPath(width, height, relativeAnchorX, relativeAnchorY);
  }

  return {
    backdropPath,
    tailPathString,
    width,
    height,
  };
}
