"use client";
import { useRef, useCallback } from "react";
import type { WTextGroup as WTextGroupType } from "@/types/canvas";
import {
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_WIDTH,
  BACKDROP_PAD_X,
  BACKDROP_PAD_Y,
} from "@/constants/canvasDefaults";
import { useWPath } from "@/hooks/useWPath";
import { useUIStore } from "@/stores/uiStore";
import WTextBlock from "../WTextBlock";

interface Props {
  panelId: string;
  group: WTextGroupType;
}

export default function WTextGroup({ panelId, group }: Props) {
  const nonDecoupledRef = useRef<HTMLDivElement>(null);
  const { backdropPath, tailPathString, width, height } = useWPath(group, nonDecoupledRef);

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
  const groupHasBg = Boolean(group.style.backgroundColor);

  const groupShapeType = group.style.shapeType;
  const groupBorderRadius = group.style.borderRadius;

  const hasDecoupled = group.blocks.some(
    (block) => Boolean(block.style.backgroundColor)
  );

  return (
    <div
      onClick={handleClick}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer ${
        isSelected ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-border-default"
      }`}
      style={{ left: 0, top: 0 }}
    >
      {/* Layer 1: Group backdrop + tail — SVG is clickable to select group */}
      {width > 0 && height > 0 && (
        <svg
          className="absolute overflow-visible"
          width={width}
          height={height}
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: groupOpacity,
          }}
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

      {/* Layer 2: Non-decoupled text blocks container (measured for backdrop) */}
      <div
        ref={nonDecoupledRef}
        className="relative z-10 flex flex-col gap-1 items-stretch text-center select-none"
        style={{
          width: "max-content",
          maxWidth: `${group.style.width ?? DEFAULT_WTG_WIDTH}px`,
          padding: `${BACKDROP_PAD_Y / 2}px ${BACKDROP_PAD_X / 2}px`,
        }}
      >
        {group.blocks.map((block) => {
          const isDecoupled = Boolean(block.style.backgroundColor);
          if (isDecoupled) return null;
          return (
            <WTextBlock
              key={block.id}
              panelId={panelId}
              groupId={group.id}
              block={block}
              groupShapeType={groupShapeType}
              groupBorderRadius={groupBorderRadius}
              groupOpacity={groupOpacity}
            />
          );
        })}
      </div>

      {/* Layer 3: Decoupled blocks container (sound effects / ad hoc overlays) */}
      {hasDecoupled && (
        <div className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 z-10 flex flex-col gap-1 items-center text-center select-none">
          {group.blocks.map((block) => {
            const isDecoupled = Boolean(block.style.backgroundColor);
            if (!isDecoupled) return null;
            return (
              <WTextBlock
                key={block.id}
                panelId={panelId}
                groupId={group.id}
                block={block}
                groupShapeType={groupShapeType}
                groupBorderRadius={groupBorderRadius}
                groupOpacity={groupOpacity}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
