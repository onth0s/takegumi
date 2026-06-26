"use client";

import { memo, useCallback } from "react";
import type { WPanel, WProject } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createTextGroup } from "@/utils/createProject";
import { deletePanelImage } from "@/utils/panelImageStorage";
import { findPanel } from "@/utils/findInProject";
import { CANVAS_MAX_WIDTH, xToPanelPercent, percentToPanelX, widthToPercent, percentToWidth, snapX, snapY, snapWidth } from "@/constants/canvasDefaults";
import { ScrubInput, SmartSlider } from "@/components/shared/UI";
import {
  InspectorButton,
  InspectorSection,
  InspectorToggle,
  AlignmentControl,
} from "./InspectorFields";

interface Props {
  panel: WPanel;
}

export default memo(function PanelInspector({ panel }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const clearSelection = useUIStore((s) => s.clearSelection);

  const mutatePanel = useCallback(
    (recipe: (p: WPanel, draft?: WProject) => void, commitType: "discrete" | "continuous" = "discrete") => {
      updateProject(
        (draft) => {
          const p = findPanel(draft, panel.id);
          if (p) recipe(p, draft);
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
      p.textGroups.push(createTextGroup(p.x + p.width / 2, p.y + p.height / 2));
    });
  }, [mutatePanel]);

  const handleBringToFront = useCallback(() => {
    mutatePanel((p, draft) => {
      if (!draft) return;
      draft.panels.forEach((panel, idx) => {
        if (panel.zIndex === undefined) {
          panel.zIndex = idx;
        }
      });
      const sorted = [...draft.panels].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
      const remaining = sorted.filter((x) => x.id !== p.id);
      remaining.forEach((x, idx) => {
        x.zIndex = idx;
      });
      p.zIndex = remaining.length;
    });
  }, [mutatePanel]);

  const handleSendToBack = useCallback(() => {
    mutatePanel((p, draft) => {
      if (!draft) return;
      draft.panels.forEach((panel, idx) => {
        if (panel.zIndex === undefined) {
          panel.zIndex = idx;
        }
      });
      const sorted = [...draft.panels].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
      const remaining = sorted.filter((x) => x.id !== p.id);
      remaining.forEach((x, idx) => {
        x.zIndex = idx + 1;
      });
      p.zIndex = 0;
    });
  }, [mutatePanel]);

  const handleBringForward = useCallback(() => {
    mutatePanel((p, draft) => {
      if (!draft) return;
      draft.panels.forEach((panel, idx) => {
        if (panel.zIndex === undefined) {
          panel.zIndex = idx;
        }
      });
      const sorted = [...draft.panels].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
      const currentIndex = sorted.findIndex((panel) => panel.id === p.id);
      if (currentIndex < sorted.length - 1) {
        const nextPanel = sorted[currentIndex + 1];
        const temp = p.zIndex;
        p.zIndex = nextPanel.zIndex;
        nextPanel.zIndex = temp;
      }
    });
  }, [mutatePanel]);

  const handleSendBackward = useCallback(() => {
    mutatePanel((p, draft) => {
      if (!draft) return;
      draft.panels.forEach((panel, idx) => {
        if (panel.zIndex === undefined) {
          panel.zIndex = idx;
        }
      });
      const sorted = [...draft.panels].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
      const currentIndex = sorted.findIndex((panel) => panel.id === p.id);
      if (currentIndex > 0) {
        const prevPanel = sorted[currentIndex - 1];
        const temp = p.zIndex;
        p.zIndex = prevPanel.zIndex;
        prevPanel.zIndex = temp;
      }
    });
  }, [mutatePanel]);

  const endContinuous = () => useProjectStore.getState().endContinuousCommit();

  const grid = useProjectStore((s) => s.project?.grid);
  const gutter = panel.style?.gutter;
  const freeX = panel.style?.freeX ?? false;
  const freeY = panel.style?.freeY ?? false;
  const isSnappingX = (grid?.snapEnabled ?? false) && !freeX;
  const isSnappingY = (grid?.snapEnabled ?? false) && !freeY;
  const freeWidth = panel.style?.freeWidth ?? false;
  const hasImage = panel.imageUrl !== null;
  const panelPercent = xToPanelPercent(panel.x, panel.width);

  const handleAlign = useCallback(
    (dir: "left" | "center" | "right") => {
      mutatePanel((p) => {
        const percent = dir === "left" ? 0 : dir === "center" ? 50 : 100;
        const bw = p.borderEnabled ? (p.borderWidth ?? 4) : 0;
        if (grid?.snapEnabled && !p.style?.freeWidth) {
          const effectiveGridSize = dir === "center" ? grid.size * 2 : grid.size;
          const snapped = snapWidth(p.width, effectiveGridSize, true, false, bw);
          if (p.width > 0 && snapped !== p.width) {
            p.height = Math.round(p.height * (snapped / p.width));
            p.width = snapped;
          }
        }
        p.x = percentToPanelX(percent, p.width);
      });
    },
    [mutatePanel, grid?.snapEnabled, grid?.size]
  );

  const currentAlign: "left" | "center" | "right" =
    panelPercent <= 2 ? "left" :
    panelPercent >= 98 ? "right" : "center";

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Position">
        <div className="flex flex-col gap-3">
          <SmartSlider label={`Position: ${panelPercent}%`} value={panelPercent} min={0} max={100} step={1} fineStep={1}
            ctrlSteps={[0, 25, 50, 75, 100]}
            onChange={(v) => mutatePanel((p) => {
              const rawX = percentToPanelX(v, p.width);
              const bw = p.borderEnabled ? (p.borderWidth ?? 4) : 0;
              p.x = snapX(rawX, grid?.size ?? 1, grid?.snapEnabled ?? false, p.style?.freeX, bw);
            }, "continuous")}
            onCommit={endContinuous}
          />
          <ScrubInput label="X" value={Math.round(panel.x)} step={isSnappingX ? (grid?.size ?? 1) : 1} fineStep={1} min={-9999} max={9999} suffix="px"
            onChange={(v) => mutatePanel((p) => {
              const bw = p.borderEnabled ? (p.borderWidth ?? 4) : 0;
              p.x = snapX(v, grid?.size ?? 1, grid?.snapEnabled ?? false, p.style?.freeX, bw);
            }, "continuous")}
            onCommit={endContinuous}
          />
          <ScrubInput label="Y" value={Math.round(panel.y)} step={isSnappingY ? (grid?.size ?? 1) : 1} fineStep={1} min={-9999} max={9999} suffix="px"
            onChange={(v) => mutatePanel((p, draft) => {
              const bw = p.borderEnabled ? (p.borderWidth ?? 4) : 0;
              const newY = snapY(v, grid?.size ?? 1, grid?.snapEnabled ?? false, p.style?.freeY, bw);
              const deltaY = newY - p.y;
              if (deltaY !== 0 && draft) {
                // Shift child text groups of the active panel
                p.textGroups.forEach((group) => {
                  group.y += deltaY;
                  if (group.tailAnchor) {
                    group.tailAnchor.y += deltaY;
                  }
                });

                const targetIndex = draft.panels.findIndex((x: WPanel) => x.id === p.id);
                if (targetIndex !== -1) {
                  for (let i = targetIndex + 1; i < draft.panels.length; i++) {
                    draft.panels[i].y += deltaY;
                    draft.panels[i].textGroups.forEach((group) => {
                      group.y += deltaY;
                      if (group.tailAnchor) {
                        group.tailAnchor.y += deltaY;
                      }
                    });
                  }
                }
              }
              p.y = newY;
            }, "continuous")}
            onCommit={endContinuous}
          />
          {grid?.snapEnabled && (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-text-secondary">Free X</span>
                <InspectorToggle
                  checked={freeX}
                  onChange={(checked) =>
                    mutatePanel((p) => {
                      p.style = { ...p.style, freeX: checked || undefined };
                      if (!checked && grid.snapEnabled) {
                        const bw = p.borderEnabled ? (p.borderWidth ?? 4) : 0;
                        p.x = snapX(p.x, grid.size, true, false, bw);
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
                    mutatePanel((p, draft) => {
                      p.style = { ...p.style, freeY: checked || undefined };
                      if (!checked && grid.snapEnabled) {
                        const bw = p.borderEnabled ? (p.borderWidth ?? 4) : 0;
                        const newY = snapY(p.y, grid.size, true, false, bw);
                        const deltaY = newY - p.y;
                        if (deltaY !== 0 && draft) {
                          p.textGroups.forEach((group) => {
                            group.y += deltaY;
                            if (group.tailAnchor) {
                              group.tailAnchor.y += deltaY;
                            }
                          });
                          const targetIndex = draft.panels.findIndex((x: WPanel) => x.id === p.id);
                          if (targetIndex !== -1) {
                            for (let i = targetIndex + 1; i < draft.panels.length; i++) {
                              draft.panels[i].y += deltaY;
                              draft.panels[i].textGroups.forEach((group) => {
                                group.y += deltaY;
                                if (group.tailAnchor) {
                                  group.tailAnchor.y += deltaY;
                                }
                              });
                            }
                          }
                          p.y = newY;
                        }
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
          <SmartSlider label={`Width: ${widthToPercent(panel.width)}%`} value={widthToPercent(panel.width)} min={10} max={100} step={1} fineStep={1}
            ctrlSteps={[10, 25, 50, 75, 100]}
            onChange={(v) => mutatePanel((p) => {
              const rawWidth = percentToWidth(v);
              const oldWidth = p.width;
              
              const maxX = CANVAS_MAX_WIDTH - oldWidth;
              const percent = maxX > 0 ? (p.x / maxX) * 100 : 50;
              const isCentered = Math.abs(percent - 50) <= 2;
              
              const bw = p.borderEnabled ? (p.borderWidth ?? 4) : 0;
              const effectiveGridSize = isCentered ? (grid?.size ?? 1) * 2 : (grid?.size ?? 1);
              const newWidth = snapWidth(rawWidth, effectiveGridSize, grid?.snapEnabled ?? false, p.style?.freeWidth, bw);
              
              // Scale height proportionally to maintain aspect ratio
              if (oldWidth > 0) {
                p.height = Math.round(p.height * (newWidth / oldWidth));
              }

              if (percent <= 2) {
                p.x = 0;
              } else if (percent >= 98) {
                p.x = CANVAS_MAX_WIDTH - newWidth;
              } else if (isCentered) {
                p.x = percentToPanelX(50, newWidth);
              } else {
                const center = p.x + oldWidth / 2;
                let nextX = center - newWidth / 2;
                if (grid?.snapEnabled && !p.style?.freeX) {
                  nextX = snapX(nextX, grid.size, true, false, bw);
                } else {
                  nextX = Math.round(nextX);
                }
                p.x = nextX;
              }
              p.width = newWidth;
            }, "continuous")}
            onCommit={endContinuous}
          />
          {grid?.snapEnabled && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-secondary">Free Width</span>
              <InspectorToggle
                checked={freeWidth}
                onChange={(checked) =>
                  mutatePanel((p) => {
                    p.style = { ...p.style, freeWidth: checked || undefined };
                    if (!checked && grid.snapEnabled) {
                      const oldWidth = p.width;
                      const maxX = CANVAS_MAX_WIDTH - oldWidth;
                      const pct = maxX > 0 ? (p.x / maxX) * 100 : 50;
                      const isCentered = Math.abs(pct - 50) <= 2;
                      const bw = p.borderEnabled ? (p.borderWidth ?? 4) : 0;
                      const effectiveGridSize = isCentered ? grid.size * 2 : grid.size;
                      const snapped = snapWidth(oldWidth, effectiveGridSize, true, false, bw);
                      
                      // Scale height proportionally to maintain aspect ratio
                      if (oldWidth > 0 && snapped !== oldWidth) {
                        p.height = Math.round(p.height * (snapped / oldWidth));
                      }

                      if (pct <= 2) p.x = 0;
                      else if (pct >= 98) p.x = CANVAS_MAX_WIDTH - snapped;
                      else if (isCentered) p.x = percentToPanelX(50, snapped);
                      else {
                        let nextX = p.x + oldWidth / 2 - snapped / 2;
                        if (grid.snapEnabled && !p.style?.freeX) {
                          nextX = snapX(nextX, grid.size, true, false, bw);
                        } else {
                          nextX = Math.round(nextX);
                        }
                        p.x = nextX;
                      }
                      p.width = snapped;
                    }
                  })
                }
              />
            </div>
          )}
        </div>
        {gutter !== undefined && (
          <ScrubInput label="Gutter" value={gutter} step={1} fineStep={1} min={0} max={100} suffix="px"
            onChange={(v) => mutatePanel((p) => { p.style = { ...p.style, gutter: v }; }, "continuous")}
            onCommit={endContinuous}
          />
        )}
        <p className="text-xs text-text-tertiary">
          {panel.textGroups.length} text group{panel.textGroups.length !== 1 ? "s" : ""}
        </p>
      </InspectorSection>

      <InspectorSection title="Image">
        {hasImage ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-tertiary truncate" title={panel.imageUrl!}>
              {panel.imageUrl!.length > 30 ? panel.imageUrl!.slice(0, 30) + "…" : panel.imageUrl}
            </span>
            <button
              type="button"
              onClick={() => {
                mutatePanel((p) => { p.imageUrl = null; });
                deletePanelImage(panel.id).catch(() => {});
              }}
              className="text-xs text-danger hover:text-danger/80 shrink-0"
            >
              Clear
            </button>
          </div>
        ) : (
          <span className="text-xs text-text-tertiary">No image</span>
        )}
      </InspectorSection>

      <InspectorSection title="Border">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">Enable Border</span>
          <InspectorToggle
            checked={!!panel.borderEnabled}
            onChange={(checked) =>
              mutatePanel((p) => {
                p.borderEnabled = checked;
              })
            }
          />
        </div>
        {panel.borderEnabled && (
          <div className="flex flex-col gap-3 mt-3">
            <ScrubInput
              label="Border Width"
              value={panel.borderWidth ?? 4}
              step={1}
              fineStep={1}
              min={1}
              max={50}
              suffix="px"
              onChange={(v) =>
                mutatePanel((p) => {
                  p.borderWidth = v;
                }, "continuous")
              }
              onCommit={endContinuous}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-secondary">Border Color</span>
              <input
                type="color"
                value={panel.borderColor ?? "#000000"}
                onChange={(e) =>
                  mutatePanel((p) => {
                    p.borderColor = e.target.value;
                  })
                }
                className="w-8 h-8 rounded cursor-pointer border border-border-default bg-transparent"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-secondary">Disable Synthetic Border</span>
              <InspectorToggle
                checked={!!panel.disableSyntheticBorder}
                onChange={(checked) =>
                  mutatePanel((p) => {
                    p.disableSyntheticBorder = checked;
                  })
                }
              />
            </div>
          </div>
        )}
      </InspectorSection>

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

      <InspectorSection title="Actions">
        <InspectorButton onClick={handleAddTextGroup}>Add text group</InspectorButton>
        <InspectorButton variant="danger" onClick={handleDelete} className="mt-2">
          Delete panel
        </InspectorButton>
      </InspectorSection>
    </div>
  );
});
