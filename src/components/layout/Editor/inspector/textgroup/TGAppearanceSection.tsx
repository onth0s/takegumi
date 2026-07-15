import type { WTextGroup, WTextGroupStyle } from "@/types/canvas";
import { SmartSlider, SegmentedControl, ColorControl } from "@/components/shared/UI";
import {
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_SHAPE_TYPE,
} from "@/constants/canvasDefaults";
import { InspectorSection } from "../InspectorFields";

interface Props {
  group: WTextGroup;
  mutateGroup: (recipe: (g: WTextGroup) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
}

export function TGAppearanceSection({ group, mutateGroup, endContinuous }: Props) {
  const shapeType = group.style.shapeType ?? DEFAULT_WTG_SHAPE_TYPE;
  const backgroundColor = group.style.backgroundColor ?? DEFAULT_WTG_BACKGROUND_COLOR;
  const opacity = group.style.opacity ?? DEFAULT_WTG_OPACITY;

  return (
    <InspectorSection title="Appearance">
      <SegmentedControl label="Shape"
        options={[
          { value: "rect", label: "Rect" },
          { value: "rounded-rectangle", label: "Rounded" },
          { value: "pill", label: "Pill" },
          { value: "action-burst", label: "Burst" },
        ]}
        value={shapeType}
        onChange={(v) => mutateGroup((g) => { g.style.shapeType = v as WTextGroupStyle["shapeType"]; }, "discrete")}
      />
      <ColorControl label="Background" value={backgroundColor}
        onChange={(v) => mutateGroup((g) => { g.style.backgroundColor = v; })}
        onCommit={endContinuous}
      />
      <SmartSlider label={`Opacity (${Math.round(opacity * 100)}%)`}
        value={opacity} min={0} max={1} step={0.05} fineStep={0.01}
        ctrlSteps={[0, 0.25, 0.5, 0.75, 1]}
        onChange={(v) => mutateGroup((g) => { g.style.opacity = v; })}
        onCommit={endContinuous}
      />
    </InspectorSection>
  );
}
