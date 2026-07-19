"use client";
import { useCallback, useState } from "react";
import type { WProject as WProjectType } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createBlankPanel } from "@/utils/createProject";
import { processImageFiles } from "@/utils/processImageFiles";
import { useImageDrop } from "@/hooks/useImageDrop";
import ImageDropZone from "@/components/shared/ImageDropZone";
import WGrid from "../WGrid";
import { PortalContext } from "./PortalContext";

// Import layers
import { PanelLayer } from "./PanelLayer";
import { TextGroupLayer } from "./TextGroupLayer";

interface Props {
  project: WProjectType;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export default function WProject({ project, scrollRef }: Props) {
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
      processImageFiles(files, project.panels).then((panels) => {
        updateProject((draft) => {
          panels.forEach((p) => {
            draft.panels.push(p);
          });
        });
      }).catch((err) => console.error("Failed to process images:", err));
    },
    [updateProject, project.panels]
  );

  const drop = useImageDrop(handleFiles);
  const hideAllText = useUIStore((s) => s.hideAllText);

  const [bordersTarget, setBordersTarget] = useState<HTMLDivElement | null>(null);
  const [selectionTarget, setSelectionTarget] = useState<HTMLDivElement | null>(null);

  const panelsBottom = project.panels.length > 0 
    ? Math.max(...project.panels.map((p) => p.y + p.height)) 
    : 0;
  const contentHeight = Math.max(500, panelsBottom + 280);

  return (
    <PortalContext.Provider value={{ bordersTarget, selectionTarget }}>
      <div
        ref={scrollRef}
        onClick={handleCanvasClick}
        className={`relative w-full max-w-[960px] h-full overflow-y-auto overflow-x-hidden no-scrollbar ${
          project.canvasTheme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
        <div style={{ position: "relative", width: "100%", height: `${contentHeight}px` }}>
          {project.grid.showGrid && (
            <WGrid gridSize={project.grid.size} canvasTheme={project.canvasTheme} height={contentHeight} />
          )}
          
          {/* Layer 1: Panel Backgrounds */}
          <PanelLayer panels={project.panels} />

          {/* Layer 2: Global Text Overlays */}
          <TextGroupLayer panels={project.panels} hideAllText={hideAllText} />

          {/* Portals */}
          <div ref={setBordersTarget} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }} />
          <div ref={setSelectionTarget} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 25 }} />

          <div 
            className="grid grid-cols-[560px_1fr] gap-[20px] shrink-0 px-[40px] w-full"
            style={{ position: "absolute", bottom: "40px", left: 0 }}
          >
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

            <button
              type="button"
              id="create-blank-wpanel-btn"
              onClick={handleCreateBlankPanel}
              className="group flex flex-col items-center justify-center gap-[10px] h-[200px] px-[30px] border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-accent/50 border-border-default/60 hover:border-accent/50 hover:bg-accent/5 w-full text-left"
            >
              <div className="w-10 h-10 rounded-full border border-border-default/60 flex items-center justify-center group-hover:border-accent/50 transition-colors duration-200">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-tertiary group-hover:text-accent transition-colors duration-200">
                  <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1 items-center w-full">
                <p className="text-sm text-text-secondary group-hover:text-accent transition-colors duration-200 text-center w-full">
                  Create blank WPanel
                </p>
                <p className="text-xs text-text-tertiary text-center w-full">Start from scratch</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </PortalContext.Provider>
  );
}
