import { memo } from "react";
import type { WPanel as WPanelType, WTextGroup as WTextGroupType } from "@/types/canvas";
import WTextGroup from "../WTextGroup";

interface Props {
  panels: WPanelType[];
  hideAllText: boolean;
}

interface MemoizedGroupProps {
  panelId: string;
  group: WTextGroupType;
  panelBorderEnabled: boolean;
  hideAllText: boolean;
}

const MemoizedTextGroupItem = memo(function MemoizedTextGroupItem({
  panelId,
  group,
  panelBorderEnabled,
  hideAllText,
}: MemoizedGroupProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${group.x}px`,
        top: `${group.y}px`,
        pointerEvents: hideAllText ? "none" : "auto",
      }}
    >
      <WTextGroup panelId={panelId} group={group} panelBorderEnabled={panelBorderEnabled} />
    </div>
  );
});

export function TextGroupLayer({ panels, hideAllText }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 20,
        visibility: hideAllText ? "hidden" : "visible",
      }}
    >
      {panels.map((panel) => {
        const panelBorderEnabled = panel.borderEnabled && !panel.disableSyntheticBorder;
        return panel.textGroups.map((group) => (
          <MemoizedTextGroupItem
            key={group.id}
            panelId={panel.id}
            group={group}
            panelBorderEnabled={panelBorderEnabled}
            hideAllText={hideAllText}
          />
        ));
      })}
    </div>
  );
}
