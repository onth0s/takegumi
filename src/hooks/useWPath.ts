import { useState, useEffect, RefObject } from "react";
import type { WTextGroup } from "@/types/canvas";
import { roundedRectPath, pillPath, actionBurstPath, tailPath } from "@/utils/pathGenerators";

export interface WPathResult {
  backdropPath: string;
  tailPathString: string | null;
  width: number;
  height: number;
}

export function useWPath(group: WTextGroup, contentRef: RefObject<HTMLElement | null>): WPathResult {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateDimensions = () => {
      // Add padding to the measured client width/height
      const padX = 24;
      const padY = 16;
      setDimensions({
        width: el.clientWidth + padX,
        height: el.clientHeight + padY,
      });
    };

    // Initial measurement
    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [contentRef]);

  const { width, height } = dimensions;
  const shape = group.style.shapeType ?? "rounded-rectangle";
  const r = group.style.borderRadius ?? 8;

  let backdropPath = "";
  if (width > 0 && height > 0) {
    if (shape === "pill") {
      backdropPath = pillPath(width, height);
    } else if (shape === "action-burst") {
      backdropPath = actionBurstPath(width, height);
    } else {
      backdropPath = roundedRectPath(width, height, r);
    }
  }

  // Calculate tail path relative to bubble bounds if tailAnchor is present.
  // tailAnchor in the schema is relative to the parent WPanel.
  // The text group bubble center is at (group.x, group.y).
  // The top-left of the bubble of size (width, height) is at (group.x - width/2, group.y - height/2) due to translate translation.
  // So the relative tail anchor coordinate is:
  // anchorX = tailAnchor.x - (group.x - width/2)
  // anchorY = tailAnchor.y - (group.y - height/2)
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
