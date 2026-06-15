"use client";

import { memo, useCallback } from "react";
import type { WTextGroup, WTextGroupStyle } from "@/types/canvas";
import {
  DEFAULT_PANEL_WIDTH,
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_SHAPE_TYPE,
  DEFAULT_WTG_WIDTH,
  GROUP_PADDING,
  wtgWidthToPercent,
  wtgPercentToWidth,
  snapGroupWidth,
  snapX,
  snapY,
} from "@/constants/canvasDefaults";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createTextBlock } from "@/utils/createProject";
import { findPanel, findTextGroup } from "@/utils/findInProject";
import { SmartSlider, ScrubInput, SegmentedControl, ColorControl, ToggleSwitch } from "@/components/shared/UI";
import {
  AlignmentControl,
  InspectorButton,
  InspectorSection,
  FieldRowHorizontal,
  InspectorToggle,
} from "./InspectorFields";

interface Props {
  panelId: string;
  group: WTextGroup;
}

export default memo(function TextGroupInspector({ panelId, group }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const selectTextBlock = useUIStore((s) => s.selectTextBlock);

  const mutateGroup = useCallback(
    (recipe: (g: WTextGroup) => void, commitType: "discrete" | "continuous" = "discrete") => {
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

  const endContinuous = () => useProjectStore.getState().endContinuousCommit();

  const project = useProjectStore((s) => s.project);
  const parentPanel = project ? findPanel(project, panelId) : null;
  const panelX = parentPanel?.x ?? 0;
  const panelWidth = parentPanel?.width ?? DEFAULT_PANEL_WIDTH;

  const freeX = group.style.freeX ?? false;
  const freeY = group.style.freeY ?? false;
  const isSnappingX = (project?.grid?.snapEnabled ?? false) && !freeX;
  const isSnappingY = (project?.grid?.snapEnabled ?? false) && !freeY;

  const handleAlign = useCallback(
    (dir: "left" | "center" | "right") => {
      mutateGroup((g) => {
        let targetX = 0;
        if (dir === "left") targetX = panelX + GROUP_PADDING;
        else if (dir === "center") targetX = panelX + Math.round(panelWidth / 2);
        else targetX = panelX + panelWidth - GROUP_PADDING;

        if (project?.grid?.snapEnabled && !g.style.freeX) {
          targetX = snapX(targetX, project.grid.size, true, false);
        }
        g.x = targetX;
      }, "discrete");
    },
    [mutateGroup, panelX, panelWidth, project?.grid]
  );

  const alignOffsets = {
    left: panelX + GROUP_PADDING,
    center: panelX + Math.round(panelWidth / 2),
    right: panelX + panelWidth - GROUP_PADDING,
  };
  const currentAlign: "left" | "center" | "right" =
    Math.abs(group.x - alignOffsets.left) <= 2 ? "left" :
    Math.abs(group.x - alignOffsets.center) <= 2 ? "center" :
    Math.abs(group.x - alignOffsets.right) <= 2 ? "right" : "center";

  const shapeType = group.style.shapeType ?? DEFAULT_WTG_SHAPE_TYPE;
  const backgroundColor = group.style.backgroundColor ?? DEFAULT_WTG_BACKGROUND_COLOR;
  const opacity = group.style.opacity ?? DEFAULT_WTG_OPACITY;
  const borderRadius = group.style.borderRadius ?? DEFAULT_WTG_BORDER_RADIUS;
  const borderWidth = group.style.borderWidth ?? DEFAULT_WTG_BORDER_WIDTH;
  const hasTail = group.tailAnchor !== null;
  const tailX = group.tailAnchor?.x ?? group.x;
  const tailY = group.tailAnchor?.y ?? group.y + 80;

  const widthVal = group.style.width ?? DEFAULT_WTG_WIDTH;
  const freeWidth = group.style.freeWidth ?? false;
  const widthPct = wtgWidthToPercent(widthVal);

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Position">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <ScrubInput label="X" value={Math.round(group.x)} step={isSnappingX ? (project?.grid?.size ?? 1) : 1} fineStep={1} min={0} max={9999} suffix="px"
              onChange={(v) => mutateGroup((g) => {
                g.x = snapX(v, project?.grid?.size ?? 1, project?.grid?.snapEnabled ?? false, g.style.freeX);
              }, "continuous")}
              onCommit={endContinuous}
            />
            <ScrubInput label="Y" value={Math.round(group.y)} step={isSnappingY ? (project?.grid?.size ?? 1) : 1} fineStep={1} min={0} max={9999} suffix="px"
              onChange={(v) => mutateGroup((g) => {
                g.y = snapY(v, project?.grid?.size ?? 1, project?.grid?.snapEnabled ?? false, g.style.freeY);
              }, "continuous")}
              onCommit={endContinuous}
            />
          </div>
          {project?.grid?.snapEnabled && (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-text-secondary">Free X</span>
                <InspectorToggle
                  checked={freeX}
                  onChange={(checked) =>
                    mutateGroup((g) => {
                      g.style.freeX = checked || undefined;
                      if (!checked && project.grid.snapEnabled) {
                        g.x = snapX(g.x, project.grid.size, true, false);
                      }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-text-secondary">Free Y</span>
                <InspectorToggle
                  checked={freeY}
                  onChange={(checked) =>
                    mutateGroup((g) => {
                      g.style.freeY = checked || undefined;
                      if (!checked && project.grid.snapEnabled) {
                        g.y = snapY(g.y, project.grid.size, true, false);
                      }
                    })
                  }
                />
              </div>
            </>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary">Align</span>
            <AlignmentControl value={currentAlign} onChange={handleAlign} />
          </div>
        </div>
      </InspectorSection>

      <InspectorSection title="Dimensions">
        <div className="flex flex-col gap-3">
          <SmartSlider
            label={wtgWidthToPercent(widthVal) === 0 ? "Width: Tight" : `Width: ${wtgWidthToPercent(widthVal)}%`}
            value={wtgWidthToPercent(widthVal)}
            min={0}
            max={100}
            step={1}
            fineStep={1}
            ctrlSteps={[0, 10, 25, 50, 75, 100]}
            onChange={(v) => mutateGroup((g) => {
              const rawPx = wtgPercentToWidth(v);
              const effectiveGridSize = (project?.grid?.size ?? 1) * 2;
              const snappedPx = snapGroupWidth(rawPx, effectiveGridSize, project?.grid?.snapEnabled ?? false, g.style.freeWidth);
              g.style.width = snappedPx;
            }, "continuous")}
            onCommit={endContinuous}
          />
          {project?.grid?.snapEnabled && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-secondary">Free Width</span>
              <InspectorToggle
                checked={freeWidth}
                onChange={(checked) =>
                  mutateGroup((g) => {
                    g.style.freeWidth = checked || undefined;
                    if (!checked && project.grid.snapEnabled) {
                      const effectiveGridSize = project.grid.size * 2;
                      g.style.width = snapGroupWidth(g.style.width ?? DEFAULT_WTG_WIDTH, effectiveGridSize, true, false);
                    }
                  })
                }
              />
            </div>
          )}
        </div>
      </InspectorSection>

      <InspectorSection title="Appearance">
        <SegmentedControl label="Shape"
          options={[
            { value: "rounded-rectangle", label: "Rounded" },
            { value: "pill", label: "Pill" },
            { value: "action-burst", label: "Burst" },
            { value: "rect", label: "Rect" },
          ]}
          value={shapeType}
          onChange={(v) => mutateGroup((g) => { g.style.shapeType = v as WTextGroupStyle["shapeType"]; }, "discrete")}
        />
        <ColorControl label="Background" value={backgroundColor}
          onChange={(v) => mutateGroup((g) => { g.style.backgroundColor = v; })}
          onCommit={endContinuous}
        />
        <SmartSlider label={`Opacity (${Math.round(opacity * 100)}%)`}
          value={opacity} min={0} max={1} step={0.05} fineStep={0.01}
          ctrlSteps={[0, 0.25, 0.5, 0.75, 1]}
          onChange={(v) => mutateGroup((g) => { g.style.opacity = v; })}
          onCommit={endContinuous}
        />
        <div className="grid grid-cols-2 gap-2">
          <ScrubInput label="Border radius" value={borderRadius} step={1} fineStep={1} min={0} max={200} suffix="px"
            onChange={(v) => mutateGroup((g) => { g.style.borderRadius = v; })}
            onCommit={endContinuous}
          />
          <ScrubInput label="Border width" value={borderWidth} step={1} fineStep={1} min={0} max={50} suffix="px"
            onChange={(v) => mutateGroup((g) => { g.style.borderWidth = v; })}
            onCommit={endContinuous}
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Speech Tail" defaultOpen={hasTail}>
        <FieldRowHorizontal label="Show tail">
          <ToggleSwitch checked={hasTail}
            onChange={(v) => mutateGroup((g) => {
              g.tailAnchor = v ? { x: g.x, y: g.y + 80 } : null;
            }, "discrete")}
          />
        </FieldRowHorizontal>
        {hasTail && (
          <div className="grid grid-cols-2 gap-2">
            <ScrubInput label="Anchor X" value={Math.round(tailX)} step={1} fineStep={1} min={0} max={9999} suffix="px"
              onChange={(v) => mutateGroup((g) => { g.tailAnchor = { x: v, y: g.tailAnchor?.y ?? tailY }; }, "continuous")}
              onCommit={endContinuous}
            />
            <ScrubInput label="Anchor Y" value={Math.round(tailY)} step={1} fineStep={1} min={0} max={9999} suffix="px"
              onChange={(v) => mutateGroup((g) => { g.tailAnchor = { x: g.tailAnchor?.x ?? tailX, y: v }; }, "continuous")}
              onCommit={endContinuous}
            />
          </div>
        )}
      </InspectorSection>

      <InspectorSection title={`Blocks (${group.blocks.length})`} defaultOpen={false}>
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
          {group.blocks.map((block, idx) => (
            <button
              key={block.id}
              type="button"
              onClick={() => selectTextBlock(panelId, group.id, block.id)}
              className="text-xs text-left px-2 py-1 rounded hover:bg-surface-hover text-text-secondary truncate"
            >
              {idx + 1}. {block.text.slice(0, 40) || "(empty)"}
            </button>
          ))}
          {group.blocks.length === 0 && (
            <span className="text-xs text-text-tertiary">No blocks</span>
          )}
        </div>
      </InspectorSection>

      <div className="border-t border-border-subtle pt-4 space-y-2">
        <InspectorButton onClick={handleAddBlock}>Add text block</InspectorButton>
        <InspectorButton variant="danger" onClick={handleDelete}>
          Delete text group
        </InspectorButton>
      </div>
    </div>
  );
});
