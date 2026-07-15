import { useMemo } from "react";
import type { WTextGroup } from "@/types/canvas";
import {
  DEFAULT_WTG_SHAPE_TYPE,
  DEFAULT_WTG_BORDER_RADIUS,
  BACKDROP_PAD_X,
  BACKDROP_PAD_Y,
} from "@/constants/canvasDefaults";
import { getBackdropPath, tailPath } from "@/utils/pathGenerators";
import { measureText } from "@/utils/measureText";

export interface WPathResult {
  backdropPath: string;
  tailPathString: string | null;
  width: number;
  height: number;
}

export function useWPath(group: WTextGroup): WPathResult {
  const { width, height } = useMemo(() => {
    if (group.style.width && group.style.height) {
      return { width: group.style.width, height: group.style.height };
    }

    const padX = BACKDROP_PAD_X;
    const padY = BACKDROP_PAD_Y;
    const gap = 4; // gap-1 in Tailwind is 4px

    const fixedWidth = group.style.width;
    const wrapWidth = fixedWidth ? Math.max(50, fixedWidth - padX) : 300;

    let totalContentHeight = 0;
    let maxContentWidth = 0;

    group.blocks.forEach((block, idx) => {
      const fontSize = block.style.fontSize;
      const fontFamily = block.style.fontFamily;
      const fontWeight = block.style.fontWeight;
      const lineHeight = block.style.lineHeight;

      const measured = measureText(block.text, {
        fontSize,
        fontFamily,
        fontWeight,
        lineHeight,
        maxWidth: wrapWidth,
      });

      maxContentWidth = Math.max(maxContentWidth, measured.width);
      totalContentHeight += measured.height;
      if (idx > 0) {
        totalContentHeight += gap;
      }
    });

    const computedWidth = fixedWidth ?? (maxContentWidth + padX);
    const computedHeight = group.style.height ?? (totalContentHeight + padY);

    return {
      width: Math.ceil(computedWidth),
      height: Math.ceil(computedHeight),
    };
  }, [group.style.width, group.style.height, group.blocks]);

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
