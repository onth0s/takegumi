import type { WPanel as WPanelType } from "@/types/canvas";
import WTextGroup from "../WTextGroup";
import WPanelImage from "./WPanelImage";

interface Props {
  panel: WPanelType;
}

export default function WPanel({ panel }: Props) {
  return (
    <div
      className="relative bg-surface-elevated border border-border-default rounded shadow-md overflow-visible flex-shrink-0"
      style={{ width: `${panel.width}px`, height: `${panel.height}px` }}
    >
      {/* Background image layer */}
      {panel.imageUrl ? (
        <WPanelImage
          imageUrl={panel.imageUrl}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#808080]" />
      )}

      {/* Text group overlay — absolutely positioned within panel coordinate space */}
      <div className="relative w-full h-full">
        {panel.textGroups.map((group) => (
          <WTextGroup key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
