"use client";

import { useCallback, useRef, useState } from "react";
import type { WPanel as WPanelType } from "@/types/canvas";
import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
import { useWBorder } from "@/hooks/useWBorder";
import { snapX, snapY } from "@/utils/snapMath";
import { shiftPanelsBelow } from "@/utils/panelReflow";
import WPanelImage from "./WPanelImage";
import WBorder from "./WBorder";

interface Props {
  panel: WPanelType;
  disableSyntheticBorderGlobal?: boolean;
}

export default function WPanel({ panel, disableSyntheticBorderGlobal = false }: Props) {
  const selectedPanelId = useUIStore((s) => s.selectedWPanelId);
  const selectedGroupId = useUIStore((s) => s.selectedWTextGroupId);
  const selectPanel = useUIStore((s) => s.selectPanel);
  const isSelected = selectedPanelId === panel.id && !selectedGroupId;
  const [isHovered, setIsHovered] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const updateProject = useProjectStore((s) => s.updateProject);
  const grid = useProjectStore((s) => s.project?.grid);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const { pathD, borderColor, borderWidth, enabled, maskRects } = useWBorder({
    panel,
    panelRef,
    disableSyntheticBorderGlobal,
  });

  // 10% top-left corner hover zone detection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) return;
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      // 10% threshold or min 36px
      const zoneW = Math.max(36, panel.width * 0.10);
      const zoneH = Math.max(36, panel.height * 0.10);

      const inZone = relX >= 0 && relX <= zoneW && relY >= 0 && relY <= zoneH;
      setIsHandleHovered(inZone);
    },
    [isDragging, panel.width, panel.height]
  );

  const handlePointerDownDrag = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      setIsDragging(true);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: panel.x,
        initialY: panel.y,
      };
      selectPanel(panel.id);
    },
    [panel.id, panel.x, panel.y, selectPanel]
  );

  const handlePointerMoveDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      const rawX = dragRef.current.initialX + dx;
      const rawY = dragRef.current.initialY + dy;

      const bw = panel.borderEnabled ? panel.borderWidth : 0;
      const nextX = snapX(rawX, grid?.size ?? 1, grid?.snapEnabled ?? false, panel.style?.freeX, bw);
      const nextY = snapY(rawY, grid?.size ?? 1, grid?.snapEnabled ?? false, panel.style?.freeY, bw);

      const deltaY = nextY - panel.y;

      updateProject((draft) => {
        const targetPanel = draft.panels.find((p) => p.id === panel.id);
        if (targetPanel) {
          targetPanel.x = nextX;
          if (deltaY !== 0) {
            shiftPanelsBelow(draft, panel.id, deltaY);
            targetPanel.y = nextY;
          }
        }
      }, "continuous", panel.id);
    },
    [isDragging, panel.id, panel.borderEnabled, panel.borderWidth, panel.style?.freeX, panel.style?.freeY, panel.y, grid, updateProject]
  );

  const handlePointerUpDrag = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        setIsDragging(false);
        useProjectStore.getState().endContinuousCommit();
      }
    },
    [isDragging]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectPanel(panel.id);
    },
    [panel.id, selectPanel]
  );

  const hasImage = !!panel.imageUrl;
  const showHandle = (isHandleHovered || isDragging) && isHovered;

  return (
    <div
      ref={panelRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsHandleHovered(false);
      }}
      className={`relative shadow-md overflow-visible shrink-0 cursor-pointer ${
        hasImage ? "animate-panel-fade-in" : "bg-surface-elevated"
      }`}
      style={{ width: `${panel.width}px`, height: `${panel.height}px` }}
    >
      {/* Background image layer — fills the full panel; border grows outward */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${panel.width}px`,
          height: `${panel.height}px`,
          overflow: "hidden",
        }}
      >
        {hasImage ? (
          <WPanelImage
            imageUrl={panel.imageUrl}
            className="w-full h-full block object-cover"
          />
        ) : (
          <div className="w-full h-full bg-placeholder" />
        )}
      </div>

      {/* 10% Top-Left Hover Zone Drag Handle */}
      {showHandle && (
        <div
          title="Drag to reorder/move panel"
          onPointerDown={handlePointerDownDrag}
          onPointerMove={handlePointerMoveDrag}
          onPointerUp={handlePointerUpDrag}
          className="absolute top-2 left-2 z-30 flex items-center justify-center w-7 h-7 rounded bg-black/80 text-accent border border-accent/60 shadow-lg cursor-grab active:cursor-grabbing hover:bg-accent hover:text-black transition-colors duration-150 select-none"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="5" cy="4" r="1" fill="currentColor" />
            <circle cx="11" cy="4" r="1" fill="currentColor" />
            <circle cx="5" cy="8" r="1" fill="currentColor" />
            <circle cx="11" cy="8" r="1" fill="currentColor" />
            <circle cx="5" cy="12" r="1" fill="currentColor" />
            <circle cx="11" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* Border + selection ring — always mounted so the ring portal works */}
      <WBorder
        pathD={enabled ? pathD : ""}
        borderColor={borderColor}
        borderWidth={borderWidth}
        width={panel.width}
        height={panel.height}
        x={panel.x}
        y={panel.y}
        panelId={panel.id}
        maskRects={maskRects}
        isSelected={isSelected}
        isHovered={!isSelected && isHovered}
      />
    </div>
  );
}
