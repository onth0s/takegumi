"use client";

import { useCallback, useRef } from "react";
import type { WPanel } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createTextGroup } from "@/utils/createProject";
import { deletePanelImage, savePanelImage, toLocalImageUrl } from "@/utils/panelImageStorage";
import { deleteSelectedEntity } from "@/utils/deleteEntity";
import { bringToFront, sendToBack, bringForward, sendBackward } from "@/utils/panelLayering";
import { shiftPanelsBelow } from "@/utils/panelReflow";
import { useMutateEntity } from "@/hooks/useMutateEntity";
import { InspectorButton, InspectorSection } from "./InspectorFields";

// Import sub-sections
import { PanelPositionSection } from "./panel/PanelPositionSection";
import { PanelDimensionsSection } from "./panel/PanelDimensionsSection";
import { PanelImageSection } from "./panel/PanelImageSection";
import { PanelBorderSection } from "./panel/PanelBorderSection";
import { PanelLayeringSection } from "./panel/PanelLayeringSection";

interface Props {
  panel: WPanel;
}

export default function PanelInspector({ panel }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const clearSelection = useUIStore((s) => s.clearSelection);

  const { mutate: mutatePanel, endContinuous } = useMutateEntity("panel", { panelId: panel.id });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      const tempUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = tempUrl;
      img.onload = () => {
        URL.revokeObjectURL(tempUrl);
        const aspect = img.naturalHeight / img.naturalWidth;
        const newHeight = Math.round(panel.width * aspect);
        const heightDelta = newHeight - panel.height;

        savePanelImage(panel.id, file)
          .then(() => {
            mutatePanel((p, draft) => {
              p.imageUrl = toLocalImageUrl(p.id);
              p.height = newHeight;

              if (heightDelta !== 0 && draft) {
                shiftPanelsBelow(draft, p.id, heightDelta);
              }
            });
          })
          .catch((err) => {
            console.error("Failed to save panel image", err);
          });
      };
      img.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        savePanelImage(panel.id, file)
          .then(() => {
            mutatePanel((p) => {
              p.imageUrl = toLocalImageUrl(p.id);
            });
          })
          .catch((err) => {
            console.error("Failed to save panel image", err);
          });
      };
    },
    [panel.id, panel.width, panel.height, mutatePanel]
  );

  const handleClearImage = useCallback(() => {
    mutatePanel((p) => {
      p.imageUrl = null;
    });
    deletePanelImage(panel.id).catch((err) => {
      console.error("Failed to delete image for panel", panel.id, err);
    });
  }, [panel.id, mutatePanel]);

  const handleDelete = useCallback(() => {
    updateProject(
      (draft) => {
        deleteSelectedEntity(draft, panel.id, null, null);
      },
      "discrete",
      panel.id
    );
    deletePanelImage(panel.id).catch((err) => {
      console.error("Failed to delete image for panel", panel.id, err);
    });
    clearSelection();
  }, [updateProject, panel.id, clearSelection]);

  const handleAddTextGroup = useCallback(() => {
    mutatePanel((p) => {
      p.textGroups.push(createTextGroup(p.x + p.width / 2, p.y + p.height / 2));
    });
  }, [mutatePanel]);

  const handleBringToFront = useCallback(() => {
    mutatePanel((p, draft) => {
      if (!draft) return;
      bringToFront(draft.panels, p.id);
    });
  }, [mutatePanel]);

  const handleSendToBack = useCallback(() => {
    mutatePanel((p, draft) => {
      if (!draft) return;
      sendToBack(draft.panels, p.id);
    });
  }, [mutatePanel]);

  const handleBringForward = useCallback(() => {
    mutatePanel((p, draft) => {
      if (!draft) return;
      bringForward(draft.panels, p.id);
    });
  }, [mutatePanel]);

  const handleSendBackward = useCallback(() => {
    mutatePanel((p, draft) => {
      if (!draft) return;
      sendBackward(draft.panels, p.id);
    });
  }, [mutatePanel]);

  const grid = useProjectStore((s) => s.project?.grid);

  return (
    <div className="flex flex-col gap-6">
      <PanelPositionSection
        panel={panel}
        mutatePanel={mutatePanel}
        endContinuous={endContinuous}
        grid={grid}
      />

      <PanelDimensionsSection
        panel={panel}
        mutatePanel={mutatePanel}
        endContinuous={endContinuous}
        grid={grid}
      />

      <PanelImageSection
        panel={panel}
        fileInputRef={fileInputRef}
        handleImageChange={handleImageChange}
        handleClearImage={handleClearImage}
      />

      <PanelBorderSection
        panel={panel}
        mutatePanel={mutatePanel}
        endContinuous={endContinuous}
      />

      <PanelLayeringSection
        panel={panel}
        handleBringToFront={handleBringToFront}
        handleSendToBack={handleSendToBack}
        handleBringForward={handleBringForward}
        handleSendBackward={handleSendBackward}
      />

      <InspectorSection title="Actions">
        <InspectorButton onClick={handleAddTextGroup}>Add text group</InspectorButton>
        <InspectorButton variant="danger" onClick={handleDelete} className="mt-2">
          Delete panel
        </InspectorButton>
      </InspectorSection>
    </div>
  );
}
