"use client";
import { useCallback, useEffect } from "react";
import { WProject } from "@/components/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { useHydration } from "@/hooks/useHydration";
import { createBlankProject } from "@/utils/createProject";


function UndoRedoBtn({ label, disabled, onClick, className }: { label: string; disabled?: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex w-10 h-10 justify-center items-center text-accent border border-accent/50 bg-black/70 hover:border-accent hover:text-text-secondary transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-accent disabled:hover:text-text-secondary ${className || ""}`}
    >
      {label === "Undo" ? "↶" : "↷"}
    </button>
  );
}

export default function Viewport() {
  const hydrated = useHydration();
  const project = useProjectStore((s) => s.project);
  const setProject = useProjectStore((s) => s.setProject);
  const clearSelection = useUIStore((s) => s.clearSelection);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const canUndo = useProjectStore((s) => s.past.length > 0 || s.tempPastState !== null);
  const canRedo = useProjectStore((s) => s.future.length > 0);

  // Seed a blank project the first time the store hydrates with no saved data.
  useEffect(() => {
    if (hydrated && project === null) {
      setProject(createBlankProject());
    }
  }, [hydrated, project, setProject]);

  const handleViewportClick = useCallback(
    () => {
      clearSelection();
    },
    [clearSelection]
  );

  if (!hydrated) {
    return (
      <div className="flex-1 h-full bg-grid flex items-center justify-center text-text-secondary text-xs tracking-widest uppercase">
        Loading…
      </div>
    );
  }

  if (!project) return null;

  const isDarkTheme = project.canvasTheme === "dark";

  return (
    <div
      onClick={handleViewportClick}
      className={`flex-1 h-full overflow-hidden ${
        isDarkTheme ? "bg-neutral-50 bg-grid-light" : "bg-grid"
      }`}
    >
      <div className="relative w-full h-full">
        <div className="absolute bottom-6 right-4 z-10 select-none flex flex-col">
          <UndoRedoBtn label="Undo" disabled={!canUndo} onClick={undo} className="rounded-t-sm border-b-0" />
          <UndoRedoBtn label="Redo" disabled={!canRedo} onClick={redo} className="rounded-b-sm" />
        </div>
        <div className="flex items-center justify-center w-full h-full">
          <div className="relative w-full max-w-[960px] h-full">
            <WProject project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}
