"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { deletePanelImage } from "@/utils/panelImageStorage";
import { findPanel } from "@/utils/findInProject";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useKeyboardShortcuts() {
  const project = useProjectStore((s) => s.project);
  const updateProject = useProjectStore((s) => s.updateProject);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);

  const selectedPanelId = useUIStore((s) => s.selectedWPanelId);
  const selectedGroupId = useUIStore((s) => s.selectedWTextGroupId);
  const selectedBlockId = useUIStore((s) => s.selectedWTextBlockId);
  const clearSelection = useUIStore((s) => s.clearSelection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (mod && (e.key === "Z" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === "Escape") {
        clearSelection();
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && project) {
        if (selectedBlockId && selectedGroupId && selectedPanelId) {
          e.preventDefault();
          updateProject(
            (draft) => {
              const panel = findPanel(draft, selectedPanelId);
              const group = panel?.textGroups.find((g) => g.id === selectedGroupId);
              if (!group || group.blocks.length <= 1) return;
              group.blocks = group.blocks.filter((b) => b.id !== selectedBlockId);
            },
            "discrete",
            selectedBlockId
          );
          useUIStore.getState().setSelectedTextBlockId(null);
          return;
        }

        if (selectedGroupId && selectedPanelId) {
          e.preventDefault();
          updateProject(
            (draft) => {
              const panel = findPanel(draft, selectedPanelId);
              if (!panel) return;
              panel.textGroups = panel.textGroups.filter((g) => g.id !== selectedGroupId);
            },
            "discrete",
            selectedGroupId
          );
          useUIStore.getState().setSelectedTextGroupId(null);
          useUIStore.getState().setSelectedTextBlockId(null);
          return;
        }

        if (selectedPanelId) {
          e.preventDefault();
          const panelId = selectedPanelId;
          updateProject(
            (draft) => {
              draft.panels = draft.panels.filter((p) => p.id !== panelId);
            },
            "discrete",
            panelId
          );
          deletePanelImage(panelId).catch((err) => {
            console.error("Failed to delete image for panel", panelId, err);
          });
          clearSelection();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    project,
    updateProject,
    undo,
    redo,
    clearSelection,
    selectedPanelId,
    selectedGroupId,
    selectedBlockId,
  ]);
}
