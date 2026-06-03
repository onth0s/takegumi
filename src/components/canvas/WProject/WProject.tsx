"use client";
import { useCallback } from "react";
import type { WProject as WProjectType } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createBlankPanel } from "@/utils/createProject";
import { processImageFiles } from "@/utils/processImageFiles";
import { useImageDrop } from "@/hooks/useImageDrop";
import ImageDropZone from "@/components/shared/ImageDropZone";
import WPanel from "../WPanel";
import WGrid from "../WGrid";
import DebugAxis from "@/components/debug/DebugAxis";

interface Props {
  project: WProjectType;
}

export default function WProject({ project }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const clearSelection = useUIStore((s) => s.clearSelection);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  const handleCreateBlankPanel = useCallback(() => {
    updateProject((draft) => {
      draft.panels.push(createBlankPanel(undefined, draft.panels));
    });
  }, [updateProject]);

  const handleFiles = useCallback(
    (files: FileList) => {
      processImageFiles(files).then((panels) => {
        updateProject((draft) => {
          panels.forEach((p) => {
            draft.panels.push(p);
          });
        });
      }).catch((err) => console.error("Failed to process images:", err));
    },
    [updateProject]
  );

  const drop = useImageDrop(handleFiles);

  return (
    <div
      onClick={handleCanvasClick}
      className={`relative w-full max-w-[960px] h-full overflow-y-auto no-scrollbar flex flex-col gap-[40px] pt-[40px] pb-[40px] ${
        project.canvasTheme === "dark" ? "bg-black" : "bg-white"
      }`}
    >
      {project.grid.showGrid && (
        <WGrid gridSize={project.grid.size} canvasTheme={project.canvasTheme} />
      )}
      {process.env.NODE_ENV === "development" && <DebugAxis />}
      {project.panels.map((panel) => (
        <div
          key={panel.id}
          style={{ alignSelf: 'flex-start', marginLeft: panel.x, marginTop: panel.y }}
        >
          <WPanel panel={panel} />
        </div>
      ))}

      <div className={`grid grid-cols-[560px_1fr] gap-[20px] shrink-0 px-[40px] ${project.panels.length > 0 ? "mt-auto" : ""}`}>
        <ImageDropZone
          id="viewport-drop-zone"
          variant="editor"
          isDragOver={drop.isDragOver}
          fileInputRef={drop.fileInputRef}
          onOpen={drop.openFilePicker}
          onKeyDown={drop.handleKeyDown}
          onDragOver={drop.handleDragOver}
          onDragLeave={drop.handleDragLeave}
          onDrop={drop.handleDrop}
          onFileChange={drop.handleFileChange}
        />

        <div
          role="button"
          tabIndex={0}
          id="create-blank-wpanel-btn"
          onClick={handleCreateBlankPanel}
          onKeyDown={(e) => e.key === "Enter" && handleCreateBlankPanel()}
          className="group flex flex-col items-center justify-center gap-[10px] h-[200px] px-[30px] border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-accent/50 border-border-default/60 hover:border-accent/50 hover:bg-accent/5"
        >
          <div className="w-10 h-10 rounded-full border border-border-default/60 flex items-center justify-center group-hover:border-accent/50 transition-colors duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-tertiary group-hover:text-accent transition-colors duration-200">
              <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <p className="text-sm text-text-secondary group-hover:text-accent transition-colors duration-200">
              Create blank WPanel
            </p>
            <p className="text-xs text-text-tertiary">Start from scratch</p>
          </div>
        </div>
      </div>
    </div>
  );
}
