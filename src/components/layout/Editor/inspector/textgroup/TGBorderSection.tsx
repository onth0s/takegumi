import type { WTextGroup } from "@/types/canvas";
import { SmartSlider, ScrubInput, SegmentedControl, ColorControl } from "@/components/shared/UI";
import {
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_BORDER_COLOR,
  DEFAULT_WTG_BORDER_OPACITY,
} from "@/constants/canvasDefaults";
import { InspectorSection, InspectorToggle } from "../InspectorFields";

interface Props {
  group: WTextGroup;
  mutateGroup: (recipe: (g: WTextGroup) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
}

export function TGBorderSection({ group, mutateGroup, endContinuous }: Props) {
  const borderRadius = group.style.borderRadius ?? DEFAULT_WTG_BORDER_RADIUS;
  const borderWidth = group.style.borderWidth ?? DEFAULT_WTG_BORDER_WIDTH;
  const borderColor = group.style.borderColor ?? DEFAULT_WTG_BORDER_COLOR;
  const borderOpacity = group.style.borderOpacity ?? DEFAULT_WTG_BORDER_OPACITY;

  return (
    <InspectorSection title="Border">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Border Enabled</span>
          <InspectorToggle
            checked={borderWidth > 0}
            onChange={(checked) =>
              mutateGroup((g) => {
                g.style.borderWidth = checked ? 2 : 0;
              })
            }
          />
        </div>
        {borderWidth > 0 && (
          <>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
              <SmartSlider
                label={`Border Width (${borderWidth}px)`}
                value={borderWidth}
                min={1}
                max={20}
                step={1}
                fineStep={1}
                onChange={(v) =>
                  mutateGroup((g) => {
                    g.style.borderWidth = v;
                  }, "continuous")
                }
                onCommit={endContinuous}
              />
              <ColorControl
                label="Border Color"
                value={borderColor}
                onChange={(v) =>
                  mutateGroup((g) => {
                    g.style.borderColor = v;
                  })
                }
              />
            </div>
            <SmartSlider
              label={`Border Opacity (${Math.round(borderOpacity * 100)}%)`}
              value={borderOpacity}
              min={0}
              max={1}
              step={0.05}
              fineStep={0.01}
              ctrlSteps={[0, 0.25, 0.5, 0.75, 1]}
              onChange={(v) =>
                mutateGroup((g) => {
                  g.style.borderOpacity = v;
                })
              }
              onCommit={endContinuous}
            />
            <ScrubInput
              label="Border radius"
              value={borderRadius}
              step={1}
              fineStep={1}
              min={0}
              max={200}
              suffix="px"
              onChange={(v) =>
                mutateGroup((g) => {
                  g.style.borderRadius = v;
                })
              }
              onCommit={endContinuous}
            />
            <SegmentedControl
              label="Border Mode"
              options={[
                { value: "overlap", label: "Overlap" },
                { value: "union", label: "Union" },
              ]}
              value={group.style.borderMode ?? "overlap"}
              onChange={(v) =>
                mutateGroup((g) => {
                  g.style.borderMode = v as "overlap" | "union";
                })
              }
            />
          </>
        )}
      </div>
    </InspectorSection>
  );
}
