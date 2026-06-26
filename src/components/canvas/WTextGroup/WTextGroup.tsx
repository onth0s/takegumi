"use client";
import { useRef, useCallback } from "react";
import type { WTextGroup as WTextGroupType } from "@/types/canvas";
import {
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_BORDER_COLOR,
  DEFAULT_WTG_BORDER_OPACITY,
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_BORDER_MODE,
  BACKDROP_PAD_X,
  BACKDROP_PAD_Y,
} from "@/constants/canvasDefaults";
import { useWPath } from "@/hooks/useWPath";
import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
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
  const borderColor = group.style.borderColor ?? DEFAULT_WTG_BORDER_COLOR;
  const borderOpacity = group.style.borderOpacity ?? DEFAULT_WTG_BORDER_OPACITY;
  const fillColor = group.style.backgroundColor ?? DEFAULT_WTG_BACKGROUND_COLOR;

  // Check if bubble overlaps panel boundary in union mode
  const panel = useProjectStore((s) => s.project?.panels.find((p) => p.id === panelId));
  const borderMode = group.style.borderMode ?? DEFAULT_WTG_BORDER_MODE;
  const panelBorderEnabled = panel?.borderEnabled && !panel.disableSyntheticBorder;

  const gLeft = group.x - width / 2 - (panel?.x ?? 0);
  const gTop = group.y - height / 2 - (panel?.y ?? 0);
  const gRight = gLeft + width;
  const gBottom = gTop + height;
  const pWidth = panel?.width ?? 0;
  const pHeight = panel?.height ?? 0;
  const overlapsPanel = gLeft < 0 || gTop < 0 || gRight > pWidth || gBottom > pHeight;

  const isUnionMode = borderMode === "union" && panelBorderEnabled && overlapsPanel;
  const strokeColor = borderWidth > 0 && !isUnionMode ? borderColor : "none";
  const groupHasBg = Boolean(group.style.backgroundColor);

  const groupShapeType = group.style.shapeType;
  const groupBorderRadius = group.style.borderRadius;

  return (
    <div
      id={`text-group-${group.id}`}
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
          }}
        >
          <defs>
            <mask id={`mask-${group.id}`}>
              {/* White rect to keep everything outside the bubble */}
              <rect
                x={-width}
                y={-height}
                width={width * 3}
                height={height * 3}
                fill="white"
              />
              {/* Black bubble path to mask out the inside */}
              {backdropPath && <path d={backdropPath} fill="black" />}
              {tailPathString && <path d={tailPathString} fill="black" />}
            </mask>
          </defs>

          {/* 1. Backdrop Fill */}
          {backdropPath && groupHasBg && (
            <path
              d={backdropPath}
              fill={fillColor}
              fillOpacity={groupOpacity}
              stroke="none"
            />
          )}

          {/* 2. Tail Fill */}
          {tailPathString && (
            <path
              d={tailPathString}
              fill={fillColor}
              fillOpacity={groupOpacity}
              stroke="none"
            />
          )}

          {/* 3. Backdrop Stroke (masked to only draw outside) */}
          {backdropPath && groupHasBg && borderWidth > 0 && (
            <path
              d={backdropPath}
              fill="none"
              stroke={strokeColor}
              strokeWidth={borderWidth * 2}
              strokeOpacity={borderOpacity}
              mask={`url(#mask-${group.id})`}
            />
          )}

          {/* 4. Tail Stroke (masked to only draw outside) */}
          {tailPathString && borderWidth > 0 && (
            <path
              d={tailPathString}
              fill="none"
              stroke={strokeColor}
              strokeWidth={borderWidth * 2}
              strokeOpacity={borderOpacity}
              mask={`url(#mask-${group.id})`}
            />
          )}
        </svg>
      )}

      {/* Layer 2: Text blocks container (measured for backdrop) */}
      <div
        ref={nonDecoupledRef}
        className="relative z-10 flex flex-col gap-1 items-stretch justify-center text-center select-none"
        style={{
          width: group.style.width ? `${group.style.width}px` : "max-content",
          maxWidth: group.style.width ? `${group.style.width}px` : "max-content",
          height: group.style.height ? `${group.style.height}px` : "auto",
          maxHeight: group.style.height ? `${group.style.height}px` : "none",
          padding: `${BACKDROP_PAD_Y / 2}px ${BACKDROP_PAD_X / 2}px`,
          boxSizing: "border-box",
        }}
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
