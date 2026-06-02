"use client";
import { useRef } from "react";
import type { WTextGroup as WTextGroupType } from "@/types/canvas";
import { useWPath } from "@/hooks/useWPath";
import WTextBlock from "../WTextBlock";

interface Props {
  group: WTextGroupType;
}

export default function WTextGroup({ group }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { backdropPath, tailPathString, width, height } = useWPath(group, contentRef);

  const opacity = group.style.opacity ?? 0.5;
  const borderWidth = group.style.borderWidth ?? 0;
  const strokeColor = borderWidth > 0 ? "#000000" : "none";

  // Per README.md and canvas.yaml, background defaults to 50% black when opacity is applied
  const fillColor = group.style.backgroundColor && group.style.backgroundColor !== "#00000000"
    ? group.style.backgroundColor
    : "#000000";

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
