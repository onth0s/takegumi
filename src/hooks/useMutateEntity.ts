import { useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { findPanel, findTextGroup, findTextBlock } from "@/utils/findInProject";
import type { WPanel, WTextGroup, WTextBlock, WProject } from "@/types/canvas";

export type MutateScope = "panel" | "group" | "block";

export function useMutateEntity(
  scope: "panel",
  ids: { panelId: string }
): {
  mutate: (recipe: (p: WPanel, draft?: WProject) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
};

export function useMutateEntity(
  scope: "group",
  ids: { panelId: string; groupId: string }
): {
  mutate: (recipe: (g: WTextGroup) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
};

export function useMutateEntity(
  scope: "block",
  ids: { panelId: string; groupId: string; blockId: string }
): {
  mutate: (recipe: (b: WTextBlock) => void, commitType?: "discrete" | "continuous") => void;
  endContinuous: () => void;
};

export function useMutateEntity(
  scope: MutateScope,
  ids: { panelId: string; groupId?: string; blockId?: string }
) {
  const updateProject = useProjectStore((s) => s.updateProject);

  const endContinuous = useCallback(() => {
    useProjectStore.getState().endContinuousCommit();
  }, []);

  const mutate = useCallback(
    (
      recipe:
        | ((p: WPanel, draft?: WProject) => void)
        | ((g: WTextGroup) => void)
        | ((b: WTextBlock) => void),
      commitType: "discrete" | "continuous" = "discrete"
    ) => {
      const entityId = scope === "panel" ? ids.panelId : scope === "group" ? ids.groupId! : ids.blockId!;
      updateProject(
        (draft) => {
          if (scope === "panel") {
            const p = findPanel(draft, ids.panelId);
            if (p) (recipe as (p: WPanel, draft?: WProject) => void)(p, draft);
          } else if (scope === "group") {
            const g = findTextGroup(draft, ids.panelId, ids.groupId!);
            if (g) (recipe as (g: WTextGroup) => void)(g);
          } else if (scope === "block") {
            const b = findTextBlock(draft, ids.panelId, ids.groupId!, ids.blockId!);
            if (b) (recipe as (b: WTextBlock) => void)(b);
          }
        },
        commitType,
        entityId
      );
    },
    [updateProject, scope, ids.panelId, ids.groupId, ids.blockId]
  );

  return { mutate, endContinuous };
}
