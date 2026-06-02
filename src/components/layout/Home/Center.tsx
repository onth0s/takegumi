"use client";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";
import { createBlankProject, createBlankPanel } from "@/utils/createProject";
import { imageBlobStore } from "@/stores/imageStore";

export default function Center() {
  const router = useRouter();
  const setProject = useProjectStore((s) => s.setProject);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCreateBlank = useCallback(() => {
    setProject(createBlankProject());
    router.push("/workspace");
  }, [setProject, router]);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newProject = createBlankProject();
    const fileArray = Array.from(files);

    Promise.all(fileArray.map((file) => {
      return new Promise<any>((resolve) => {
        const tempUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = tempUrl;
        img.onload = async () => {
          const defaultWidth = 320; // 50% of default project panel area (640px)
          const aspect = img.naturalHeight / img.naturalWidth;
          const height = Math.round(defaultWidth * aspect);
          const panel = createBlankPanel({ width: defaultWidth, height });
          
          await imageBlobStore.setItem(panel.id, file);
          panel.imageUrl = `local://${panel.id}`;
          URL.revokeObjectURL(tempUrl);
          resolve(panel);
        };
        img.onerror = async () => {
          const panel = createBlankPanel();
          await imageBlobStore.setItem(panel.id, file);
          panel.imageUrl = `local://${panel.id}`;
          URL.revokeObjectURL(tempUrl);
          resolve(panel);
        };
      });
    })).then((panels) => {
      newProject.panels = panels;
      setProject(newProject);
      router.push("/workspace");
    });
  }, [setProject, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      {/* Card row */}
      <div className="flex flex-row items-stretch gap-4 w-full">

        {/* ── Drop zone ───────────────────────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          id="home-drop-zone"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            "group flex flex-col items-center justify-center gap-2 flex-[6.5] h-64 border-2 border-dashed rounded-xl bg-background cursor-pointer transition-colors duration-200 px-6 text-center outline-none focus-visible:ring-1 focus-visible:ring-accent/50",
            isDragOver
              ? "border-accent bg-accent/5"
              : "border-border-default hover:border-accent/50 hover:bg-accent/5"
          ].join(" ")}
        >
          {/* Image icon */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-border-default group-hover:text-accent/40 transition-colors duration-200">
            <rect x="3" y="3" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M3 24l8-7 6 6 4-4 12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm text-text-secondary group-hover:text-accent transition-colors duration-200">
            Drop images here
          </p>
          <p className="text-xs text-text-tertiary">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* ── Create blank project ─────────────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          id="create-blank-project-btn"
          onClick={handleCreateBlank}
          onKeyDown={(e) => e.key === "Enter" && handleCreateBlank()}
          className="group flex flex-col items-center justify-center gap-3 flex-[3.5] h-64 border-2 border-dashed border-border-default rounded-xl bg-surface cursor-pointer transition-colors duration-200 hover:border-accent/50 hover:bg-accent/5 px-6 text-center outline-none focus-visible:ring-1 focus-visible:ring-accent/50"
        >
          {/* Plus circle */}
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

      {/* Secondary import options */}
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
