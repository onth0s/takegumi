"use client";

import { useCallback } from "react";
import type { WTextBlock } from "@/types/canvas";
import {
  DEFAULT_WTB_COLOR,
  DEFAULT_WTB_FONT_SIZE,
  DEFAULT_WTB_FONT_WEIGHT,
  DEFAULT_WTB_TEXT_ALIGN,
} from "@/constants/canvasDefaults";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { findTextBlock } from "@/utils/findInProject";
import {
  FieldRow,
  InspectorButton,
  InspectorInput,
  InspectorSection,
  InspectorSelect,
  InspectorTextarea,
} from "./InspectorFields";

interface Props {
  panelId: string;
  groupId: string;
  block: WTextBlock;
}

export default function TextBlockInspector({ panelId, groupId, block }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);

  const mutateBlock = useCallback(
    (recipe: (b: WTextBlock) => void, commitType: "discrete" | "continuous" = "continuous") => {
      updateProject(
        (draft) => {
          const b = findTextBlock(draft, panelId, groupId, block.id);
          if (b) recipe(b);
        },
        commitType,
        block.id
      );
    },
    [updateProject, panelId, groupId, block.id]
  );

  const handleDelete = useCallback(() => {
    updateProject(
      (draft) => {
        const panel = draft.panels.find((p) => p.id === panelId);
        const group = panel?.textGroups.find((g) => g.id === groupId);
        if (group && group.blocks.length > 1) {
          group.blocks = group.blocks.filter((b) => b.id !== block.id);
        }
      },
      "discrete",
      block.id
    );
    useUIStore.getState().setSelectedTextBlockId(null);
  }, [updateProject, panelId, groupId, block.id]);

  const fontSize = block.style.fontSize ?? DEFAULT_WTB_FONT_SIZE;
  const color = block.style.color ?? DEFAULT_WTB_COLOR;
  const fontWeight = block.style.fontWeight ?? DEFAULT_WTB_FONT_WEIGHT;
  const textAlign = block.style.textAlign ?? DEFAULT_WTB_TEXT_ALIGN;

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Text Block">
        <FieldRow label="Content">
          <InspectorTextarea
            value={block.text}
            onChange={(e) => {
              mutateBlock((b) => { b.text = e.target.value; });
            }}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <FieldRow label="Font size">
          <InspectorInput
            type="number"
            min={8}
            value={fontSize}
            onChange={(e) => {
              mutateBlock((b) => { b.style.fontSize = Number(e.target.value); });
            }}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <FieldRow label="Color">
          <InspectorInput
            type="color"
            value={color}
            onChange={(e) => {
              mutateBlock((b) => { b.style.color = e.target.value; });
            }}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
        <FieldRow label="Font weight">
          <InspectorSelect
            value={fontWeight}
            onChange={(e) => {
              mutateBlock((b) => { b.style.fontWeight = e.target.value; }, "discrete");
            }}
          >
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semibold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra bold (800)</option>
          </InspectorSelect>
        </FieldRow>
        <FieldRow label="Alignment">
          <InspectorSelect
            value={textAlign}
            onChange={(e) => {
              mutateBlock(
                (b) => {
                  b.style.textAlign = e.target.value as "left" | "center" | "right";
                },
                "discrete"
              );
            }}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </InspectorSelect>
        </FieldRow>
      </InspectorSection>

      <InspectorSection title="Actions">
        <InspectorButton variant="danger" onClick={handleDelete}>
          Delete text block
        </InspectorButton>
      </InspectorSection>
    </div>
  );
}
