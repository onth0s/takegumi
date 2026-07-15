import { RefObject } from "react";
import type { WPanel } from "@/types/canvas";
import { InspectorButton, InspectorSection } from "../InspectorFields";

interface Props {
  panel: WPanel;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearImage: () => void;
}

export function PanelImageSection({ panel, fileInputRef, handleImageChange, handleClearImage }: Props) {
  const hasImage = panel.imageUrl !== null;

  return (
    <InspectorSection title="Image">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      {hasImage ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-text-tertiary truncate block w-full" title={panel.imageUrl!}>
            {panel.imageUrl}
          </span>
          <div className="flex gap-2">
            <InspectorButton onClick={() => fileInputRef.current?.click()} className="flex-1">
              Replace
            </InspectorButton>
            <InspectorButton variant="danger" onClick={handleClearImage} className="flex-1">
              Clear
            </InspectorButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          <span className="text-xs text-text-tertiary block w-full">No image</span>
          <InspectorButton onClick={() => fileInputRef.current?.click()}>
            Add Image
          </InspectorButton>
        </div>
      )}
    </InspectorSection>
  );
}
