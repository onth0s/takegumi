"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";
import { createBlankProject } from "@/utils/createProject";
import { processImageFiles } from "@/utils/processImageFiles";
import { useImageDrop } from "@/hooks/useImageDrop";
import ImageDropZone from "@/components/shared/ImageDropZone";

export default function Center() {
  const router = useRouter();
  const setProject = useProjectStore((s) => s.setProject);

  const handleCreateBlank = useCallback(() => {
    setProject(createBlankProject());
    router.push("/workspace");
  }, [setProject, router]);

  const handleFiles = useCallback(
    (files: FileList) => {
      processImageFiles(files).then((panels) => {
        const newProject = createBlankProject();
        newProject.panels = panels;
        setProject(newProject);
        router.push("/workspace");
      }).catch((err) => console.error("Failed to process images:", err));
    },
    [setProject, router]
  );

  const drop = useImageDrop(handleFiles);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <div className="flex flex-row items-stretch gap-4 w-full">
        <ImageDropZone
          id="home-drop-zone"
          variant="home"
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
          id="create-blank-project-btn"
          onClick={handleCreateBlank}
          onKeyDown={(e) => e.key === "Enter" && handleCreateBlank()}
          className="group flex flex-col items-center justify-center gap-3 flex-[3.5] h-64 border-2 border-dashed border-border-default rounded-xl bg-surface cursor-pointer transition-colors duration-200 hover:border-accent/50 hover:bg-accent/5 px-6 text-center outline-none focus-visible:ring-1 focus-visible:ring-accent/50"
        >
          <div className="w-10 h-10 rounded-full border border-border-default flex items-center justify-center group-hover:border-accent/50 transition-colors duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-tertiary group-hover:text-accent transition-colors duration-200">
              <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-text-secondary group-hover:text-accent transition-colors duration-200">
              Create blank project
            </p>
            <p className="text-xs text-text-tertiary">Start from scratch</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-text-tertiary">
        Or import a{" "}
        <span className="text-text-secondary hover:text-accent cursor-pointer transition-colors duration-150">
          project JSON
        </span>{" "}
        or{" "}
        <span className="text-text-secondary hover:text-accent cursor-pointer transition-colors duration-150">
          Markdown script
        </span>
      </p>
    </div>
  );
}
