import type { WPanel as WPanelType } from "@/types/canvas";
import WPanel from "../WPanel";
import { useProjectStore } from "@/stores/projectStore";

interface Props {
  panels: WPanelType[];
}

export function PanelLayer({ panels }: Props) {
  const disableSyntheticBorderGlobal = useProjectStore(
    (s) => s.project?.disableSyntheticBorder ?? false
  );

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
          <WPanel panel={panel} disableSyntheticBorderGlobal={disableSyntheticBorderGlobal} />
        </div>
      ))}
    </>
  );
}
