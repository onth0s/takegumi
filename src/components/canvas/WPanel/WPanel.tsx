"use client";

import { useCallback, useRef, useState } from "react";
import type { WPanel as WPanelType } from "@/types/canvas";
import { useUIStore } from "@/stores/uiStore";
import { useWBorder } from "@/hooks/useWBorder";
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

  const panelRef = useRef<HTMLDivElement>(null);

  const { pathD, borderColor, borderWidth, enabled, maskRects } = useWBorder({
    panel,
    panelRef,
    disableSyntheticBorderGlobal,
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectPanel(panel.id);
    },
    [panel.id, selectPanel]
  );

  const hasImage = !!panel.imageUrl;

  return (
    <div
      ref={panelRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
