"use client";
import { useRef, useCallback } from "react";
import type { WTextGroup as WTextGroupType } from "@/types/canvas";
import {
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_OPACITY,
} from "@/constants/canvasDefaults";
import { useWPath } from "@/hooks/useWPath";
import { useUIStore } from "@/stores/uiStore";
import WTextBlock from "../WTextBlock";

interface Props {
  panelId: string;
  group: WTextGroupType;
  panelX: number;
}

export default function WTextGroup({ panelId, group, panelX }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { backdropPath, tailPathString, width, height } = useWPath(group, contentRef);

  const selectedGroupId = useUIStore((s) => s.selectedWTextGroupId);
  const selectedBlockId = useUIStore((s) => s.selectedWTextBlockId);
  const selectTextGroup = useUIStore((s) => s.selectTextGroup);
  const isSelected = selectedGroupId === group.id && !selectedBlockId;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectTextGroup(panelId, group.id);
    },
    [panelId, group.id, selectTextGroup]
  );

  const groupOpacity = group.style.opacity ?? DEFAULT_WTG_OPACITY;
  const borderWidth = group.style.borderWidth ?? DEFAULT_WTG_BORDER_WIDTH;
  const fillColor = group.style.backgroundColor ?? DEFAULT_WTG_BACKGROUND_COLOR;
  const strokeColor = borderWidth > 0 ? fillColor : "none";

  const groupShapeType = group.style.shapeType;
  const groupBorderRadius = group.style.borderRadius;

  return (
    <div
      onClick={handleClick}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer ${
        isSelected ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-border-default"
      }`}
      style={{
        left: `${group.x - panelX}px`,
        top: `${group.y}px`,
        width: width > 0 ? `${width}px` : "auto",
        height: height > 0 ? `${height}px` : "auto",
      }}
    >
      {/* Layer 1: Group backdrop + tail (unified envelope) */}
      {width > 0 && height > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          width={width}
          height={height}
          style={{ opacity: groupOpacity }}
        >
          {backdropPath && (
            <path
              d={backdropPath}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={borderWidth}
            />
          )}
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

      {/* Layer 2: Text blocks (each may render its own backdrop over the group envelope) */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col gap-1 text-center select-none"
      >
        {group.blocks.map((block) => (
          <WTextBlock
            key={block.id}
            panelId={panelId}
            groupId={group.id}
            block={block}
            groupShapeType={groupShapeType}
            groupBorderRadius={groupBorderRadius}
            groupOpacity={groupOpacity}
          />
        ))}
      </div>
    </div>
  );
}
