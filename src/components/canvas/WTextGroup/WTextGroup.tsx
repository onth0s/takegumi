"use client";
import { useRef } from "react";
import type { WTextGroup as WTextGroupType } from "@/types/canvas";
import {
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_OPACITY,
} from "@/constants/canvasDefaults";
import { useWPath } from "@/hooks/useWPath";
import WTextBlock from "../WTextBlock";

interface Props {
  group: WTextGroupType;
}

export default function WTextGroup({ group }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { backdropPath, tailPathString, width, height } = useWPath(group, contentRef);

  const opacity = group.style.opacity ?? DEFAULT_WTG_OPACITY;
  const borderWidth = group.style.borderWidth ?? DEFAULT_WTG_BORDER_WIDTH;
  const strokeColor = borderWidth > 0 ? DEFAULT_WTG_BACKGROUND_COLOR : "none";

  const fillColor = group.style.backgroundColor ?? DEFAULT_WTG_BACKGROUND_COLOR;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      style={{
        left: `${group.x}px`,
        top: `${group.y}px`,
        width: width > 0 ? `${width}px` : "auto",
        height: height > 0 ? `${height}px` : "auto",
      }}
    >
      {/* Layer 1 (Backgrounds Only): Renders background shape under group opacity */}
      {width > 0 && height > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          width={width}
          height={height}
          style={{ opacity }}
        >
          {/* Backdrop path */}
          {backdropPath && (
            <path
              d={backdropPath}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={borderWidth}
            />
          )}
          {/* Tail path */}
          {tailPathString && (
            <path
              d={tailPathString}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={borderWidth}
            />
          )}
        </svg>
      )}

      {/* Layer 2 (Foregrounds Only): Opaque text lines */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col gap-1 text-center select-none"
      >
        {group.blocks.map((block) => (
          <WTextBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
