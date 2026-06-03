"use client";
import { useCallback, useEffect } from "react";
import { WProject, WGrid } from "@/components/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { useHydration } from "@/hooks/useHydration";
import { createBlankProject } from "@/utils/createProject";
import DebugAxis from "@/components/debug/DebugAxis";

export default function Viewport() {
  const hydrated = useHydration();
  const project = useProjectStore((s) => s.project);
  const setProject = useProjectStore((s) => s.setProject);
  const clearSelection = useUIStore((s) => s.clearSelection);

  // Seed a blank project the first time the store hydrates with no saved data.
  useEffect(() => {
    if (hydrated && project === null) {
      setProject(createBlankProject());
    }
  }, [hydrated, project, setProject]);

  if (!hydrated) {
    return (
      <div className="flex-1 h-full bg-grid flex items-center justify-center text-text-secondary text-xs tracking-widest uppercase">
        Loading…
      </div>
    );
  }

  if (!project) return null;

  const handleViewportClick = useCallback(
    () => {
      clearSelection();
    },
    [clearSelection]
  );

  const isDarkTheme = project.canvasTheme === "dark";

  return (
    <div
      onClick={handleViewportClick}
      className={`flex-1 h-full overflow-hidden ${
        isDarkTheme ? "bg-neutral-50 bg-grid-light" : "bg-grid"
      }`}
    >
      <div className="relative w-full h-full">
        {project.grid.showGrid && (
          <WGrid gridSize={project.grid.size} canvasTheme={project.canvasTheme} />
        )}
        <div className="flex items-center justify-center w-full h-full">
          <WProject project={project} />
        </div>
        {process.env.NODE_ENV === "development" && <DebugAxis />}
      </div>
    </div>
  );
}
