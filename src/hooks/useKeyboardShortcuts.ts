"use client";

import { useEffect, useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { deletePanelImage } from "@/utils/panelImageStorage";
import { deleteSelectedEntity } from "@/utils/deleteEntity";

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

  const handleDelete = useCallback(() => {
    if (!project) return;
    let deletedInfo: { deletedId: string; type: "block" | "group" | "panel" } | null = null;
    updateProject(
      (draft) => {
        deletedInfo = deleteSelectedEntity(draft, selectedPanelId, selectedGroupId, selectedBlockId);
      },
      "discrete",
      selectedBlockId || selectedGroupId || selectedPanelId || undefined
    );

    if (deletedInfo) {
      const { deletedId, type } = deletedInfo;
      if (type === "block") {
        useUIStore.getState().setSelectedTextBlockId(null);
      } else if (type === "group") {
        useUIStore.getState().setSelectedTextGroupId(null);
        useUIStore.getState().setSelectedTextBlockId(null);
      } else if (type === "panel") {
        deletePanelImage(deletedId).catch((err) => {
          console.error("Failed to delete image for panel", deletedId, err);
        });
        clearSelection();
      }
    }
  }, [project, updateProject, selectedPanelId, selectedGroupId, selectedBlockId, clearSelection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const mod = e.metaKey || e.ctrlKey;
      const key = e.key;
      const shift = e.shiftKey;

      const shortcuts = [
        {
          match: () => mod && key === "z" && !shift,
          action: () => {
            e.preventDefault();
            undo();
          },
        },
        {
          match: () => mod && (key === "Z" || (key === "z" && shift)),
          action: () => {
            e.preventDefault();
            redo();
          },
        },
        {
          match: () => key === "Escape",
          action: () => {
            clearSelection();
          },
        },
        {
          match: () => key === "Delete" || key === "Backspace",
          action: () => {
            e.preventDefault();
            handleDelete();
          },
        },
      ];

      for (const shortcut of shortcuts) {
        if (shortcut.match()) {
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    clearSelection,
    handleDelete,
  ]);
}
