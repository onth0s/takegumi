import type { WPanel } from "@/types/canvas";
import { ScrubInput } from "@/components/shared/UI";
import { InspectorSection, InspectorToggle } from "../InspectorFields";

interface Props {
  panel: WPanel;
  mutatePanel: (recipe: (p: WPanel) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
}

export function PanelBorderSection({ panel, mutatePanel, endContinuous }: Props) {
  return (
    <InspectorSection title="Border">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-text-secondary">Enable Border</span>
        <InspectorToggle
          checked={panel.borderEnabled}
          onChange={(checked) =>
            mutatePanel((p) => {
              p.borderEnabled = checked;
            })
          }
        />
      </div>
      {panel.borderEnabled && (
        <div className="flex flex-col gap-3 mt-3">
          <ScrubInput
            label="Border Width"
            value={panel.borderWidth}
            step={1}
            fineStep={1}
            min={1}
            max={50}
            suffix="px"
            onChange={(v) =>
              mutatePanel((p) => {
                p.borderWidth = v;
              }, "continuous")
            }
            onCommit={endContinuous}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary">Border Color</span>
            <input
              type="color"
              value={panel.borderColor}
              onChange={(e) =>
                mutatePanel((p) => {
                  p.borderColor = e.target.value;
                })
              }
              className="w-8 h-8 rounded cursor-pointer border border-border-default bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary">Disable Synthetic Border</span>
            <InspectorToggle
              checked={panel.disableSyntheticBorder}
              onChange={(checked) =>
                mutatePanel((p) => {
                  p.disableSyntheticBorder = checked;
                })
              }
            />
          </div>
        </div>
      )}
    </InspectorSection>
  );
}
