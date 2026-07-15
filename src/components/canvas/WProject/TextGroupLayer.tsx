import type { WPanel as WPanelType } from "@/types/canvas";
import WTextGroup from "../WTextGroup";

interface Props {
  panels: WPanelType[];
  hideAllText: boolean;
}

export function TextGroupLayer({ panels, hideAllText }: Props) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20,
      visibility: hideAllText ? "hidden" : "visible",
    }}>
      {panels.map((panel) =>
        panel.textGroups.map((group) => (
          <div
            key={group.id}
            style={{
              position: "absolute",
              left: `${group.x}px`,
              top: `${group.y}px`,
              pointerEvents: hideAllText ? "none" : "auto",
            }}
          >
            <WTextGroup panelId={panel.id} group={group} />
          </div>
        ))
      )}
    </div>
  );
}
