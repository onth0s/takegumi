import type { WTextGroup as WTextGroupType } from "@/types/canvas";
import WTextBlock from "../WTextBlock";

interface Props {
  group: WTextGroupType;
}

export default function WTextGroup({ group }: Props) {
  return (
    <div
      className="absolute flex flex-col gap-1"z
      style={{ left: group.x, top: group.y }}
    >
      {group.blocks.map((block) => (
        <WTextBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
