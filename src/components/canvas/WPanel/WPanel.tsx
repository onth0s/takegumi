import type { WPanel as WPanelType } from "@/types/canvas";
import WTextGroup from "../WTextGroup";

interface Props {
  panel: WPanelType;
}

export default function WPanel({ panel }: Props) {
  return (
    <div
      className="relative bg-surface-elevated border border-border-default rounded shadow-md overflow-hidden flex-shrink-0"
      style={{ width: panel.width, height: panel.height }}
    >
      {/* Background image layer */}
      {panel.imageUrl ? (
        <img
          src={panel.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-surface-elevated to-surface flex items-center justify-center text-text-tertiary text-xs tracking-widest uppercase">
          No Image
        </div>
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
