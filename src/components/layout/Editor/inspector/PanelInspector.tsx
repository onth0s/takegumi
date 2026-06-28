"use client";

import { memo, useCallback, useRef } from "react";
import type { WPanel } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createTextGroup } from "@/utils/createProject";
import { deletePanelImage, savePanelImage, toLocalImageUrl } from "@/utils/panelImageStorage";
import { bringToFront, sendToBack, bringForward, sendBackward } from "@/utils/panelLayering";
import { shiftPanelsBelow } from "@/utils/panelReflow";
import { useMutateEntity } from "@/hooks/useMutateEntity";
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

        savePanelImage(panel.id, file)
          .then(() => {
            mutatePanel((p) => {
              p.imageUrl = toLocalImageUrl(p.id);
              p.height = newHeight;
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
    [panel.id, panel.width, mutatePanel]
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
        const bw = p.borderEnabled ? p.borderWidth : 0;
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
              const bw = p.borderEnabled ? p.borderWidth : 0;
              p.x = snapX(rawX, grid?.size ?? 1, grid?.snapEnabled ?? false, p.style?.freeX, bw);
            }, "continuous")}
            onCommit={endContinuous}
          />
          <ScrubInput label="X" value={Math.round(panel.x)} step={isSnappingX ? (grid?.size ?? 1) : 1} fineStep={1} min={-9999} max={9999} suffix="px"
            onChange={(v) => mutatePanel((p) => {
              const bw = p.borderEnabled ? p.borderWidth : 0;
              p.x = snapX(v, grid?.size ?? 1, grid?.snapEnabled ?? false, p.style?.freeX, bw);
            }, "continuous")}
            onCommit={endContinuous}
          />
          <ScrubInput label="Y" value={Math.round(panel.y)} step={isSnappingY ? (grid?.size ?? 1) : 1} fineStep={1} min={-9999} max={9999} suffix="px"
            onChange={(v) => mutatePanel((p, draft) => {
              const bw = p.borderEnabled ? p.borderWidth : 0;
              const newY = snapY(v, grid?.size ?? 1, grid?.snapEnabled ?? false, p.style?.freeY, bw);
              const deltaY = newY - p.y;
              if (deltaY !== 0 && draft) {
                shiftPanelsBelow(draft, p.id, deltaY);
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
                        const bw = p.borderEnabled ? p.borderWidth : 0;
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
                        const bw = p.borderEnabled ? p.borderWidth : 0;
                        const newY = snapY(p.y, grid.size, true, false, bw);
                        const deltaY = newY - p.y;
                        if (deltaY !== 0 && draft) {
                          shiftPanelsBelow(draft, p.id, deltaY);
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
              
              const bw = p.borderEnabled ? p.borderWidth : 0;
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
                      const bw = p.borderEnabled ? p.borderWidth : 0;
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

      <InspectorSection title="Border">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">Enable Border</span>
          <InspectorToggle
            checked={panel.borderEnabled}
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
              value={panel.borderWidth}
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
                value={panel.borderColor}
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
                checked={panel.disableSyntheticBorder}
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
