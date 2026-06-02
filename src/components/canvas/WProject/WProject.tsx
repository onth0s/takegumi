"use client";
import { useCallback, useRef, useState } from "react";
import type { WProject as WProjectType } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { createBlankPanel } from "@/utils/createProject";
import WPanel from "../WPanel";

interface Props {
  project: WProjectType;
}

export default function WProject({ project }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const updateProject = useProjectStore((s) => s.updateProject);

  const handleCreateBlankPanel = useCallback(() => {
    updateProject((draft) => {
      draft.panels.push(createBlankPanel());
    });
  }, [updateProject]);

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
    // Panel creation from dropped images — Phase 4
  };

  return (
    <div className="w-4/5 bg-white h-full overflow-y-auto no-scrollbar flex flex-col gap-8 p-8">
      {/* ── Panel list ──────────────────────────────────────────────────────── */}
      {project.panels.map((panel, i) => (
        <div key={panel.id} className={project.panels.length === 1 ? "self-center" : (i % 2 === 0 ? "self-start" : "self-end")}>
          <WPanel panel={panel} />
        </div>
      ))}

      {/* ── Drop & create panel controls (always at the end) ─────────────────── */}
      <div className="flex flex-row items-stretch gap-4 w-full mt-4 flex-shrink-0">
        {/* ── Drop zone ───────────────────────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          id="viewport-drop-zone"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            "group flex flex-col items-center justify-center gap-2 flex-[6.5] h-52 px-8",
            "border-2 border-dashed rounded-2xl cursor-pointer",
            "transition-colors duration-200 outline-none",
            "focus-visible:border-gray-400",
            isDragOver
              ? "border-gray-400 bg-gray-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
          ].join(" ")}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-gray-300 group-hover:text-gray-400 transition-colors duration-200">
            <rect x="3" y="3" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M3 24l8-7 6 6 4-4 12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
            Drop images here
          </p>
          <p className="text-xs text-gray-400">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        {/* ── Create blank WPanel ─────────────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          id="create-blank-wpanel-btn"
          onClick={handleCreateBlankPanel}
          onKeyDown={(e) => e.key === "Enter" && handleCreateBlankPanel()}
          className="group flex flex-col items-center justify-center gap-3 flex-[3.5] h-52 px-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 outline-none focus-visible:border-gray-400 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        >
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-gray-400 transition-colors duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400 group-hover:text-gray-500 transition-colors duration-200">
              <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
              Create blank WPanel
            </p>
            <p className="text-xs text-gray-400">Start from scratch</p>
          </div>
        </div>
      </div>
    </div>
  );
}
