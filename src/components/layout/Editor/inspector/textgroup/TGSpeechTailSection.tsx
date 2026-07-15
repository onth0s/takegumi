import type { WTextGroup } from "@/types/canvas";
import { ScrubInput, ToggleSwitch } from "@/components/shared/UI";
import { InspectorSection, FieldRowHorizontal } from "../InspectorFields";

interface Props {
  group: WTextGroup;
  mutateGroup: (recipe: (g: WTextGroup) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
}

export function TGSpeechTailSection({ group, mutateGroup, endContinuous }: Props) {
  const hasTail = group.tailAnchor !== null;
  const tailX = group.tailAnchor?.x ?? group.x;
  const tailY = group.tailAnchor?.y ?? group.y + 80;

  return (
    <InspectorSection title="Speech Tail" defaultOpen={hasTail}>
      <FieldRowHorizontal label="Show tail">
        <ToggleSwitch checked={hasTail}
          onChange={(v) => mutateGroup((g) => {
            g.tailAnchor = v ? { x: g.x, y: g.y + 80 } : null;
          }, "discrete")}
        />
      </FieldRowHorizontal>
      {hasTail && (
        <div className="grid grid-cols-2 gap-2">
          <ScrubInput label="Anchor X" value={Math.round(tailX)} step={1} fineStep={1} min={0} max={9999} suffix="px"
            onChange={(v) => mutateGroup((g) => { g.tailAnchor = { x: v, y: g.tailAnchor?.y ?? tailY }; }, "continuous")}
            onCommit={endContinuous}
          />
          <ScrubInput label="Anchor Y" value={Math.round(tailY)} step={1} fineStep={1} min={0} max={9999} suffix="px"
            onChange={(v) => mutateGroup((g) => { g.tailAnchor = { x: g.tailAnchor?.x ?? tailX, y: v }; }, "continuous")}
            onCommit={endContinuous}
          />
        </div>
      )}
    </InspectorSection>
  );
}
