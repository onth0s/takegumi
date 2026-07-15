import type { WPanel as WPanelType } from "@/types/canvas";
import WPanel from "../WPanel";

interface Props {
  panels: WPanelType[];
}

export function PanelLayer({ panels }: Props) {
  return (
    <>
      {panels.map((panel) => (
        <div
          key={panel.id}
          style={{ 
            position: 'absolute', 
            left: panel.x, 
            top: panel.y,
            zIndex: panel.zIndex
          }}
        >
          <WPanel panel={panel} />
        </div>
      ))}
    </>
  );
}
