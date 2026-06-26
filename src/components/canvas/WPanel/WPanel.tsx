"use client";

import { useCallback, useRef } from "react";
import type { WPanel as WPanelType } from "@/types/canvas";
import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
import { useWBorder } from "@/hooks/useWBorder";
import WPanelImage from "./WPanelImage";
import WBorder from "./WBorder";

interface Props {
  panel: WPanelType;
}

export default function WPanel({ panel }: Props) {
  const selectedPanelId = useUIStore((s) => s.selectedWPanelId);
  const selectedGroupId = useUIStore((s) => s.selectedWTextGroupId);
  const selectPanel = useUIStore((s) => s.selectPanel);
  const isSelected = selectedPanelId === panel.id && !selectedGroupId;

  const project = useProjectStore((s) => s.project);
  const panelRef = useRef<HTMLDivElement>(null);

  const { pathD, borderColor, borderWidth, enabled } = useWBorder({
    panel,
    panelRef,
    disableSyntheticBorderGlobal: !!project?.disableSyntheticBorder,
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectPanel(panel.id);
    },
    [panel.id, selectPanel]
  );

  const hasImage = !!panel.imageUrl;
  const borderOffset = enabled ? borderWidth : 0;
  const imageWidth = panel.width - 2 * borderOffset;
  const imageHeight = panel.height - 2 * borderOffset;

  return (
    <div
      ref={panelRef}
      onClick={handleClick}
      className={`relative shadow-md overflow-visible shrink-0 cursor-pointer ${
        isSelected ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-border-default"
      } ${hasImage ? "animate-panel-fade-in" : "bg-surface-elevated"}`}
      style={{ width: `${panel.width}px`, height: `${panel.height}px` }}
    >
      {/* Background image layer — normal flow determines height */}
      <div
        style={{
          position: "absolute",
          left: `${borderOffset}px`,
          top: `${borderOffset}px`,
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
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

      {/* Synthetic Border Layer */}
      {enabled && (
        <WBorder
          pathD={pathD}
          borderColor={borderColor}
          borderWidth={borderWidth}
          width={panel.width}
          height={panel.height}
          x={panel.x}
          y={panel.y}
        />
      )}
    </div>
  );
}

