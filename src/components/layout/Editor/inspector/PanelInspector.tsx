"use client";

import { useCallback } from "react";
import type { WPanel } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createTextGroup } from "@/utils/createProject";
import { deletePanelImage } from "@/utils/panelImageStorage";
import { findPanel } from "@/utils/findInProject";
import {
  FieldRow,
  InspectorButton,
  InspectorInput,
  InspectorSection,
} from "./InspectorFields";

interface Props {
  panel: WPanel;
}

export default function PanelInspector({ panel }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const clearSelection = useUIStore((s) => s.clearSelection);

  const mutatePanel = useCallback(
    (recipe: (p: WPanel) => void, commitType: "discrete" | "continuous" = "discrete") => {
      updateProject(
        (draft) => {
          const p = findPanel(draft, panel.id);
          if (p) recipe(p);
        },
        commitType,
        panel.id
      );
    },
    [updateProject, panel.id]
  );

  const handleDelete = useCallback(() => {
    updateProject(
      (draft) => {
        draft.panels = draft.panels.filter((p) => p.id !== panel.id);
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
      p.textGroups.push(createTextGroup(p.width / 2, p.height / 2));
    });
  }, [mutatePanel]);

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Panel">
        <FieldRow label="Width">
          <InspectorInput
            type="number"
            min={100}
            value={panel.width}
            onChange={(e) => {
              const width = Number(e.target.value);
              if (width > 0) mutatePanel((p) => { p.width = width; }, "continuous");
            }}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <FieldRow label="Height">
          <InspectorInput
            type="number"
            min={100}
            value={panel.height}
            onChange={(e) => {
              const height = Number(e.target.value);
              if (height > 0) mutatePanel((p) => { p.height = height; }, "continuous");
            }}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <p className="text-xs text-text-tertiary">
          {panel.textGroups.length} text group{panel.textGroups.length !== 1 ? "s" : ""}
        </p>
      </InspectorSection>

      <InspectorSection title="Actions">
        <InspectorButton onClick={handleAddTextGroup}>Add text group</InspectorButton>
        <InspectorButton variant="danger" onClick={handleDelete}>
          Delete panel
        </InspectorButton>
      </InspectorSection>
    </div>
  );
}
