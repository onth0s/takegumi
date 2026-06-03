"use client";

import { memo, useCallback } from "react";
import type { WTextGroup, WTextGroupStyle } from "@/types/canvas";
import {
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_SHAPE_TYPE,
} from "@/constants/canvasDefaults";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createTextBlock } from "@/utils/createProject";
import { findTextGroup } from "@/utils/findInProject";
import {
  FieldRow,
  InspectorButton,
  InspectorInput,
  InspectorSection,
  InspectorSelect,
} from "./InspectorFields";

interface Props {
  panelId: string;
  group: WTextGroup;
}

export default memo(function TextGroupInspector({ panelId, group }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);

  const mutateGroup = useCallback(
    (recipe: (g: WTextGroup) => void, commitType: "discrete" | "continuous" = "continuous") => {
      updateProject(
        (draft) => {
          const g = findTextGroup(draft, panelId, group.id);
          if (g) recipe(g);
        },
        commitType,
        group.id
      );
    },
    [updateProject, panelId, group.id]
  );

  const handleDelete = useCallback(() => {
    updateProject(
      (draft) => {
        const panel = draft.panels.find((p) => p.id === panelId);
        if (panel) {
          panel.textGroups = panel.textGroups.filter((g) => g.id !== group.id);
        }
      },
      "discrete",
      group.id
    );
    useUIStore.getState().setSelectedTextGroupId(null);
    useUIStore.getState().setSelectedTextBlockId(null);
  }, [updateProject, panelId, group.id]);

  const handleAddBlock = useCallback(() => {
    mutateGroup((g) => {
      g.blocks.push(createTextBlock());
    }, "discrete");
  }, [mutateGroup]);

  const shapeType = group.style.shapeType ?? DEFAULT_WTG_SHAPE_TYPE;
  const backgroundColor = group.style.backgroundColor ?? DEFAULT_WTG_BACKGROUND_COLOR;
  const opacity = group.style.opacity ?? DEFAULT_WTG_OPACITY;
  const borderRadius = group.style.borderRadius ?? DEFAULT_WTG_BORDER_RADIUS;
  const hasTail = group.tailAnchor !== null;

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Text Group">
        <FieldRow label="X">
          <InspectorInput
            type="number"
            value={Math.round(group.x)}
            onChange={(e) => {
              mutateGroup((g) => { g.x = Number(e.target.value); });
            }}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <FieldRow label="Y">
          <InspectorInput
            type="number"
            value={Math.round(group.y)}
            onChange={(e) => {
              mutateGroup((g) => { g.y = Number(e.target.value); });
            }}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <FieldRow label="Shape">
          <InspectorSelect
            value={shapeType}
            onChange={(e) => {
              mutateGroup(
                (g) => {
                  g.style.shapeType = e.target.value as WTextGroupStyle["shapeType"];
                },
                "discrete"
              );
            }}
          >
            <option value="rounded-rectangle">Rounded rectangle</option>
            <option value="pill">Pill</option>
            <option value="action-burst">Action burst</option>
          </InspectorSelect>
        </FieldRow>
        <FieldRow label="Background">
          <InspectorInput
            type="color"
            value={backgroundColor}
            onChange={(e) => {
              mutateGroup((g) => { g.style.backgroundColor = e.target.value; });
            }}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <FieldRow label={`Opacity (${Math.round(opacity * 100)}%)`}>
          <InspectorInput
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => {
              mutateGroup((g) => { g.style.opacity = Number(e.target.value); });
            }}
            onMouseUp={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <FieldRow label="Border radius">
          <InspectorInput
            type="number"
            min={0}
            value={borderRadius}
            onChange={(e) => {
              mutateGroup((g) => { g.style.borderRadius = Number(e.target.value); });
            }}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <FieldRow label="Speech tail">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={hasTail}
              onChange={(e) => {
                mutateGroup(
                  (g) => {
                    g.tailAnchor = e.target.checked
                      ? { x: g.x, y: g.y + 80 }
                      : null;
                  },
                  "discrete"
                );
              }}
              className="accent-accent"
            />
            Show tail anchor
          </label>
        </FieldRow>
        <p className="text-xs text-text-tertiary">
          {group.blocks.length} text block{group.blocks.length !== 1 ? "s" : ""}
        </p>
      </InspectorSection>

      <InspectorSection title="Actions">
        <InspectorButton onClick={handleAddBlock}>Add text block</InspectorButton>
        <InspectorButton variant="danger" onClick={handleDelete}>
          Delete text group
        </InspectorButton>
      </InspectorSection>
    </div>
  );
});
