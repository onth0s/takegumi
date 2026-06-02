import { motion } from "motion/react";
import type { WPanel as WPanelType } from "@/types/canvas";
import WTextGroup from "../WTextGroup";
import WPanelImage from "./WPanelImage";

interface Props {
  panel: WPanelType;
}

export default function WPanel({ panel }: Props) {
  const hasImage = !!panel.imageUrl;

  const initial = hasImage ? { opacity: 0 } : undefined;
  const animate = hasImage ? { opacity: 1 } : undefined;
  const transition = hasImage ? { duration: 0.4, ease: "easeOut" as const } : undefined;

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={`relative shadow-md overflow-visible flex-shrink-0 ${hasImage ? "bg-transparent" : "bg-surface-elevated"}`}
      style={{ width: `${panel.width}px`, height: `${panel.height}px` }}
    >
      {/* Background image layer */}
      {hasImage ? (
        <WPanelImage
          imageUrl={panel.imageUrl}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-placeholder" />
      )}

      {/* Text group overlay — absolutely positioned within panel coordinate space */}
      <div className="relative w-full h-full">
        {panel.textGroups.map((group) => (
          <WTextGroup key={group.id} group={group} />
        ))}
      </div>
    </motion.div>
  );
}
