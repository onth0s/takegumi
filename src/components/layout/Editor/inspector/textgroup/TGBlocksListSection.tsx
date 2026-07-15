import type { WTextGroup } from "@/types/canvas";
import { InspectorSection } from "../InspectorFields";

interface Props {
  panelId: string;
  group: WTextGroup;
  selectTextBlock: (panelId: string, groupId: string, blockId: string) => void;
}

export function TGBlocksListSection({ panelId, group, selectTextBlock }: Props) {
  return (
    <InspectorSection title={`Blocks (${group.blocks.length})`} defaultOpen={false}>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {group.blocks.map((block, idx) => (
          <button
            key={block.id}
            type="button"
            onClick={() => selectTextBlock(panelId, group.id, block.id)}
            className="text-xs text-left px-2 py-1 rounded hover:bg-surface-hover text-text-secondary truncate"
          >
            {idx + 1}. {block.text.slice(0, 40) || "(empty)"}
          </button>
        ))}
        {group.blocks.length === 0 && (
          <span className="text-xs text-text-tertiary">No blocks</span>
        )}
      </div>
    </InspectorSection>
  );
}
