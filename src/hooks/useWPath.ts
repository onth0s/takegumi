import { useMemo, useState, useLayoutEffect } from "react";
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
  const [fontsReadyState, setFontsReadyState] = useState(false);

  useLayoutEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;

    let active = true;
    document.fonts.ready.then(() => {
      if (active) setFontsReadyState(true);
    });

    const handleLoadingDone = () => {
      if (active) setFontsReadyState((prev) => !prev);
    };

    document.fonts.addEventListener("loadingdone", handleLoadingDone);
    return () => {
      active = false;
      document.fonts.removeEventListener("loadingdone", handleLoadingDone);
    };
  }, []);

  const { width, height } = useMemo(() => {
    const isNumericWidth = typeof group.style.width === "number" && group.style.width > 0;
    const isNumericHeight = typeof group.style.height === "number" && group.style.height > 0;

    if (isNumericWidth && isNumericHeight) {
      return { width: group.style.width as number, height: group.style.height as number };
    }

    const padX = BACKDROP_PAD_X;
    const padY = BACKDROP_PAD_Y;
    const gap = 4; // gap-1 in Tailwind is 4px

    const fixedWidth = isNumericWidth ? (group.style.width as number) : undefined;
    const wrapWidth = fixedWidth ? Math.max(50, fixedWidth - padX) : 300;

    let totalContentHeight = 0;
    let maxContentWidth = 0;

    group.blocks.forEach((block, idx) => {
      const fontSize = block.style.fontSize;
      const fontFamily = block.style.fontFamily || group.style.fontFamily;
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

    const computedWidth = fixedWidth ?? Math.max(60, maxContentWidth + padX);
    const computedHeight = isNumericHeight ? (group.style.height as number) : Math.max(32, totalContentHeight + padY);

    // Re-evaluate when font loading state changes
    void fontsReadyState;

    return {
      width: Math.ceil(computedWidth),
      height: Math.ceil(computedHeight),
    };
  }, [group.style.width, group.style.height, group.style.fontFamily, group.blocks, fontsReadyState]);

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
