"use client";

import { useCallback, useRef } from "react";
import type { WTextBlock as WTextBlockType } from "@/types/canvas";
import type { BackdropShapeType } from "@/utils/pathGenerators";
import { getBackdropPath } from "@/utils/pathGenerators";
import {
  DEFAULT_WTB_FONT_SIZE,
  DEFAULT_WTB_OPACITY,
  DEFAULT_WTB_TEXT_ALIGN,
  DEFAULT_WTB_BACKGROUND_OPACITY,
  BACKDROP_PAD_X,
  BACKDROP_PAD_Y,
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_SHAPE_TYPE,
} from "@/constants/canvasDefaults";
import { useUIStore } from "@/stores/uiStore";
import { useElementDimensions } from "@/hooks/useElementDimensions";

interface Props {
  panelId: string;
  groupId: string;
  block: WTextBlockType;
  groupShapeType?: BackdropShapeType;
  groupBorderRadius?: number;
  groupOpacity?: number;
}

export default function WTextBlock({
  panelId,
  groupId,
  block,
  groupShapeType,
  groupBorderRadius,
  groupOpacity,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const dimensions = useElementDimensions(contentRef, [block.text]);

  const selectedBlockId = useUIStore((s) => s.selectedWTextBlockId);
  const selectTextBlock = useUIStore((s) => s.selectTextBlock);
  const isSelected = selectedBlockId === block.id;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectTextBlock(panelId, groupId, block.id);
    },
    [panelId, groupId, block.id, selectTextBlock]
  );

  const { text, style } = block;
  const hasBackdrop = Boolean(style.backgroundColor);

  const backdropWidth =
    dimensions.width > 0 ? dimensions.width + BACKDROP_PAD_X : 0;
  const backdropHeight =
    dimensions.height > 0 ? dimensions.height + BACKDROP_PAD_Y : 0;

  const shape = groupShapeType ?? DEFAULT_WTG_SHAPE_TYPE;
  const r = groupBorderRadius ?? DEFAULT_WTG_BORDER_RADIUS;
  const backdropPath =
    hasBackdrop && backdropWidth > 0 && backdropHeight > 0
      ? getBackdropPath(shape, backdropWidth, backdropHeight, r)
      : "";

  const bgOpacity = style.backgroundOpacity ?? DEFAULT_WTB_BACKGROUND_OPACITY;
  const layerOpacity = (groupOpacity ?? 1) * bgOpacity;

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-center justify-center cursor-pointer${
        isSelected ? " ring-2 ring-accent" : " hover:ring-1 hover:ring-border-default"
      }`}
      data-block-id={block.id}
    >
      {/* Layer 1: Individual backdrop */}
      {hasBackdrop && backdropPath && (
        <svg
          className="absolute pointer-events-none overflow-visible"
          width={backdropWidth}
          height={backdropHeight}
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: layerOpacity,
          }}
        >
          <path d={backdropPath} fill={style.backgroundColor!} />
        </svg>
      )}

      {/* Layer 2: Text */}
      <div
        ref={contentRef}
        className={`leading-snug px-1 rounded-sm${
          isSelected ? " outline outline-1 outline-accent bg-accent-muted" : ""
        }`}
        style={{
          fontSize:
            style.fontSize != null
              ? `${style.fontSize}px`
              : `${DEFAULT_WTB_FONT_SIZE}px`,
          fontWeight: style.fontWeight,
          color: style.color,
          fontFamily: style.fontFamily,
          lineHeight: style.lineHeight,
          textAlign: style.textAlign ?? DEFAULT_WTB_TEXT_ALIGN,
          opacity: style.opacity ?? DEFAULT_WTB_OPACITY,
          position: "relative",
          zIndex: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
}
