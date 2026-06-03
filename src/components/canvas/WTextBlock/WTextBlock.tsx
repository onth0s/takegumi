"use client";

import { useCallback } from "react";
import type { WTextBlock as WTextBlockType } from "@/types/canvas";
import {
  DEFAULT_WTB_FONT_SIZE,
  DEFAULT_WTB_OPACITY,
  DEFAULT_WTB_TEXT_ALIGN,
} from "@/constants/canvasDefaults";
import { useUIStore } from "@/stores/uiStore";

interface Props {
  panelId: string;
  groupId: string;
  block: WTextBlockType;
}

export default function WTextBlock({ panelId, groupId, block }: Props) {
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

  return (
    <div
      onClick={handleClick}
      style={{
        fontSize: style.fontSize != null ? `${style.fontSize}px` : `${DEFAULT_WTB_FONT_SIZE}px`,
        fontWeight: style.fontWeight,
        color: style.color,
        fontFamily: style.fontFamily,
        lineHeight: style.lineHeight,
        textAlign: style.textAlign ?? DEFAULT_WTB_TEXT_ALIGN,
        opacity: style.opacity ?? DEFAULT_WTB_OPACITY,
      }}
      className={`leading-snug px-1 cursor-pointer rounded-sm ${
        isSelected ? "outline outline-1 outline-accent bg-accent-muted" : ""
      }`}
    >
      {text}
    </div>
  );
}
