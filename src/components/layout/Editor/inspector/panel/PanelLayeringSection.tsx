import type { WPanel } from "@/types/canvas";
import { InspectorButton, InspectorSection } from "../InspectorFields";

interface Props {
  panel: WPanel;
  handleBringToFront: () => void;
  handleSendToBack: () => void;
  handleBringForward: () => void;
  handleSendBackward: () => void;
}

export function PanelLayeringSection({
  panel,
  handleBringToFront,
  handleSendToBack,
  handleBringForward,
  handleSendBackward,
}: Props) {
  return (
    <InspectorSection title="Layering">
      <div className="grid grid-cols-2 gap-2">
        <InspectorButton onClick={handleBringToFront}>Bring to Front</InspectorButton>
        <InspectorButton onClick={handleSendToBack}>Send to Back</InspectorButton>
        <InspectorButton onClick={handleBringForward}>Bring Forward</InspectorButton>
        <InspectorButton onClick={handleSendBackward}>Send Backward</InspectorButton>
      </div>
      {panel.zIndex !== undefined && (
        <p className="text-xs text-text-tertiary mt-2">Current Z-Index: {panel.zIndex}</p>
      )}
    </InspectorSection>
  );
}
