"use client";

import { useCallback } from "react";
import type { WTextGroup } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createTextBlock } from "@/utils/createProject";
import { useMutateEntity } from "@/hooks/useMutateEntity";
import { deleteSelectedEntity } from "@/utils/deleteEntity";
import { InspectorButton } from "./InspectorFields";

// Import sub-sections
import { TGPositionSection } from "./textgroup/TGPositionSection";
import { TGDimensionsSection } from "./textgroup/TGDimensionsSection";
import { TGAppearanceSection } from "./textgroup/TGAppearanceSection";
import { TGBorderSection } from "./textgroup/TGBorderSection";
import { TGSpeechTailSection } from "./textgroup/TGSpeechTailSection";
import { TGBlocksListSection } from "./textgroup/TGBlocksListSection";

interface Props {
  panelId: string;
  group: WTextGroup;
}

export default function TextGroupInspector({ panelId, group }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const clearSelection = useUIStore((s) => s.clearSelection);
  const selectTextBlock = useUIStore((s) => s.selectTextBlock);
  const { mutate: mutateGroup, endContinuous } = useMutateEntity("group", { panelId, groupId: group.id });

  const handleDelete = useCallback(() => {
    updateProject(
      (draft) => {
        deleteSelectedEntity(draft, panelId, group.id, null);
      },
      "discrete",
      group.id
    );
    clearSelection();
  }, [updateProject, panelId, group.id, clearSelection]);

  const handleAddBlock = useCallback(() => {
    mutateGroup((g) => {
      g.blocks.push(createTextBlock());
    }, "discrete");
  }, [mutateGroup]);

  const project = useProjectStore((s) => s.project);
  const textGroupRects = useUIStore((s) => s.textGroupRects);
  const cachedRect = textGroupRects.get(group.id);

  return (
    <div className="flex flex-col gap-6">
      <TGPositionSection
        group={group}
        mutateGroup={mutateGroup}
        endContinuous={endContinuous}
        project={project}
        cachedRect={cachedRect}
      />

      <TGDimensionsSection
        group={group}
        mutateGroup={mutateGroup}
        endContinuous={endContinuous}
        project={project}
      />

      <TGAppearanceSection
        group={group}
        mutateGroup={mutateGroup}
        endContinuous={endContinuous}
      />

      <TGBorderSection
        group={group}
        mutateGroup={mutateGroup}
        endContinuous={endContinuous}
      />

      <TGSpeechTailSection
        group={group}
        mutateGroup={mutateGroup}
        endContinuous={endContinuous}
      />

      <TGBlocksListSection
        panelId={panelId}
        group={group}
        selectTextBlock={selectTextBlock}
      />

      <div className="border-t border-border-subtle pt-4 space-y-2">
        <InspectorButton onClick={handleAddBlock}>Add text block</InspectorButton>
        <InspectorButton variant="danger" onClick={handleDelete}>
          Delete text group
        </InspectorButton>
      </div>
    </div>
  );
}
