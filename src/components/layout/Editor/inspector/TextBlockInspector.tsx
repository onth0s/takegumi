"use client";

import { memo, useCallback } from "react";
import type { WTextBlock } from "@/types/canvas";
import {
  DEFAULT_WTB_COLOR,
  DEFAULT_WTB_FONT_SIZE,
  DEFAULT_WTB_FONT_WEIGHT,
  DEFAULT_WTB_OPACITY,
  DEFAULT_WTB_BACKGROUND_OPACITY,
  DEFAULT_WTB_TEXT_ALIGN,
} from "@/constants/canvasDefaults";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { useMutateEntity } from "@/hooks/useMutateEntity";
import { SmartSlider, ScrubInput, SmartNumberInput, SegmentedControl, ColorControl } from "@/components/shared/UI";
import {
  FieldRow,
  InspectorButton,
  InspectorSection,
  InspectorSelect,
  InspectorTextarea,
} from "./InspectorFields";

interface Props {
  panelId: string;
  groupId: string;
  block: WTextBlock;
}

export default memo(function TextBlockInspector({ panelId, groupId, block }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);

  const clearSelection = useUIStore((s) => s.clearSelection);
  const { mutate: mutateBlock, endContinuous } = useMutateEntity("block", { panelId, groupId, blockId: block.id });

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
    clearSelection();
  }, [updateProject, panelId, groupId, block.id, clearSelection]);


  const fontSize = block.style.fontSize ?? DEFAULT_WTB_FONT_SIZE;
  const color = block.style.color ?? DEFAULT_WTB_COLOR;
  const fontWeight = block.style.fontWeight ?? DEFAULT_WTB_FONT_WEIGHT;
  const textAlign = block.style.textAlign ?? DEFAULT_WTB_TEXT_ALIGN;
  const blockOpacity = block.style.opacity ?? DEFAULT_WTB_OPACITY;
  const bgColor = block.style.backgroundColor;
  const bgOpacity = block.style.backgroundOpacity ?? DEFAULT_WTB_BACKGROUND_OPACITY;
  const lineHeight = block.style.lineHeight;
  const fontFamily = block.style.fontFamily;

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Content">
        <FieldRow label="Text">
          <InspectorTextarea
            value={block.text}
            onChange={(e) => mutateBlock((b) => { b.text = e.target.value; })}
            onBlur={endContinuous}
          />
        </FieldRow>
        <ScrubInput label="Font size" value={fontSize} step={1} fineStep={1} min={1} max={500} suffix="px"
          onChange={(v) => mutateBlock((b) => { b.style.fontSize = v; })}
          onCommit={endContinuous}
        />
      </InspectorSection>

      <InspectorSection title="Alignment">
        <SegmentedControl
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
          value={textAlign}
          onChange={(v) => mutateBlock((b) => { b.style.textAlign = v as "left" | "center" | "right"; }, "discrete")}
        />
      </InspectorSection>

      <InspectorSection title="Typography">
        <ColorControl label="Color" value={color}
          presets={["#ffffff", "#000000", "#dddddd", "#c4a35a", "#c45a5a"]}
          onChange={(v) => mutateBlock((b) => { b.style.color = v; })}
          onCommit={endContinuous}
        />
        <SmartNumberInput label="Font weight" value={Number(fontWeight)} step={100} fineStep={50} min={100} max={900}
          ctrlSteps={[400, 500, 600, 700, 800]}
          onChange={(v) => mutateBlock((b) => { b.style.fontWeight = String(v); })}
          onCommit={endContinuous}
        />
        <ScrubInput label="Line height" value={lineHeight ?? 1.2} step={0.1} fineStep={0.05} min={0.5} max={3} suffix="×"
          onChange={(v) => mutateBlock((b) => { b.style.lineHeight = v; })}
          onCommit={endContinuous}
        />
        <FieldRow label="Font family">
          <InspectorSelect value={fontFamily ?? ""}
            onChange={(e) => mutateBlock((b) => { b.style.fontFamily = e.target.value || undefined; }, "discrete")}
          >
            <option value="">System default</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
          </InspectorSelect>
        </FieldRow>
        <SmartSlider label={`Opacity (${Math.round(blockOpacity * 100)}%)`}
          value={blockOpacity} min={0} max={1} step={0.05} fineStep={0.01}
          ctrlSteps={[0, 0.25, 0.5, 0.75, 1]}
          onChange={(v) => mutateBlock((b) => { b.style.opacity = v; })}
          onCommit={endContinuous}
        />
      </InspectorSection>

      <InspectorSection title="Background" defaultOpen={!!bgColor}>
        <ColorControl label="Color" value={bgColor ?? "#000000"}
          onChange={(v) => mutateBlock((b) => { b.style.backgroundColor = v; })}
          onCommit={endContinuous}
        />
        {bgColor && (
          <SmartSlider label={`Bg opacity (${Math.round(bgOpacity * 100)}%)`}
            value={bgOpacity} min={0} max={1} step={0.05} fineStep={0.01}
            ctrlSteps={[0, 0.25, 0.5, 0.75, 1]}
            onChange={(v) => mutateBlock((b) => { b.style.backgroundOpacity = v; })}
            onCommit={endContinuous}
          />
        )}
      </InspectorSection>

      <div className="border-t border-border-subtle pt-4">
        <InspectorButton variant="danger" onClick={handleDelete}>
          Delete text block
        </InspectorButton>
      </div>
    </div>
  );
});
