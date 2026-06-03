"use client";

import { useCallback } from "react";
import type { WPanel as WPanelType } from "@/types/canvas";
import { useUIStore } from "@/stores/uiStore";
import WTextGroup from "../WTextGroup";
import WPanelImage from "./WPanelImage";

interface Props {
  panel: WPanelType;
}

export default function WPanel({ panel }: Props) {
  const selectedPanelId = useUIStore((s) => s.selectedWPanelId);
  const selectedGroupId = useUIStore((s) => s.selectedWTextGroupId);
  const selectPanel = useUIStore((s) => s.selectPanel);
  const isSelected = selectedPanelId === panel.id && !selectedGroupId;

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
      onClick={handleClick}
      className={`relative shadow-md overflow-visible shrink-0 cursor-pointer ${
        isSelected ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-border-default"
      } ${hasImage ? "animate-panel-fade-in" : "bg-surface-elevated"}`}
      style={{ width: `${panel.width}px` }}
    >
      {/* Background image layer — normal flow determines height */}
      {hasImage ? (
        <WPanelImage
          imageUrl={panel.imageUrl}
          className="w-full block"
        />
      ) : (
        <div className="min-h-[150px] bg-placeholder" />
      )}

      {/* Text group overlay — absolutely positioned within panel coordinate space */}
      <div className="absolute inset-0">
        {panel.textGroups.map((group) => (
          <WTextGroup key={group.id} panelId={panel.id} group={group} />
        ))}
      </div>
    </div>
  );
}
