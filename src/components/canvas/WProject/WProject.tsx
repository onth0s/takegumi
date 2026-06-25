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
import WTextGroup from "../WTextGroup";

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

  const panelsBottom = project.panels.length > 0 
    ? Math.max(...project.panels.map((p) => p.y + p.height)) 
    : 0;
  // Calculate total height of the canvas contents: panels + buffer for the drop footer
  // footer is 200px tall, plus gap/padding
  const contentHeight = Math.max(500, panelsBottom + 280);

  return (
    <div
      onClick={handleCanvasClick}
      className={`relative w-full max-w-[960px] h-full overflow-y-auto no-scrollbar ${
        project.canvasTheme === "dark" ? "bg-black" : "bg-white"
      }`}
    >
      <div style={{ position: "relative", width: "100%", height: `${contentHeight}px` }}>
        {project.grid.showGrid && (
          <WGrid gridSize={project.grid.size} canvasTheme={project.canvasTheme} />
        )}
        
        {/* Layer 1: Panel Backgrounds */}
        {project.panels.map((panel, index) => {
          return (
            <div
              key={panel.id}
              style={{ 
                position: 'absolute', 
                left: panel.x, 
                top: panel.y,
                zIndex: panel.zIndex ?? index
              }}
            >
              <WPanel panel={panel} />
            </div>
          );
        })}

        {/* Layer 2: Global Text Overlays — always mounted to preserve ResizeObserver measurements;
            toggled via visibility so dimensions never reset to 0 on re-show */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
          visibility: hideAllText ? "hidden" : "visible",
        }}>
          {project.panels.map((panel) =>
            panel.textGroups.map((group) => (
              <div
                key={group.id}
                style={{
                  position: "absolute",
                  left: `${group.x}px`,
                  top: `${panel.y + group.y}px`,
                  pointerEvents: hideAllText ? "none" : "auto",
                }}
              >
                <WTextGroup panelId={panel.id} group={group} />
              </div>
            ))
          )}
        </div>

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
  </div>
);
}
