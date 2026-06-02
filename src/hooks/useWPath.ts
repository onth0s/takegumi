import { useState, useEffect, RefObject, useMemo } from "react";
import type { WTextGroup } from "@/types/canvas";
import {
  BACKDROP_PAD_X,
  BACKDROP_PAD_Y,
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_SHAPE_TYPE,
} from "@/constants/canvasDefaults";
import { getBackdropPath, tailPath } from "@/utils/pathGenerators";

export interface WPathResult {
  backdropPath: string;
  tailPathString: string | null;
  width: number;
  height: number;
}

export function useWPath(group: WTextGroup, contentRef: RefObject<HTMLElement | null>): WPathResult {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const blocksKey = useMemo(
    () => group.blocks.map((b) => `${b.id}:${b.text}`).join("\0"),
    [group.blocks]
  );

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateDimensions = () => {
      setDimensions({
        width: el.clientWidth + BACKDROP_PAD_X,
        height: el.clientHeight + BACKDROP_PAD_Y,
      });
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [blocksKey, contentRef]);

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
