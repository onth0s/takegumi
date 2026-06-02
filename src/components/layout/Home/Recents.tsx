"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";
import ProjectCard from "./recents/ProjectCard";
import ProjectRow from "./recents/ProjectRow";

import type { WProject } from "@/types/canvas";

const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 340;

export default function Recents() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const router = useRouter();
  const projects = useProjectStore((s) => s.projects || []);
  const setProject = useProjectStore((s) => s.setProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      e.preventDefault();
    },
    [width]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth.current + delta)));
    };
    const onMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleSelectProject = useCallback(
    (proj: WProject) => {
      setProject(proj);
      router.push("/workspace");
    },
    [setProject, router]
  );

  const handleDeleteProject = useCallback(
    (id: string) => {
      deleteProject(id);
      setConfirmingDeleteId(null);
    },
    [deleteProject]
  );

  const sharedItemProps = {
    confirmingDeleteId,
    setConfirmingDeleteId,
    onDelete: handleDeleteProject,
  };

  return (
    <div
      className="h-full border border-border-default bg-surface rounded-lg flex overflow-hidden select-none shrink-0"
      style={{ width }}
    >
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-border-subtle flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Recents
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded cursor-pointer transition-colors duration-150 ${viewMode === "grid" ? "bg-accent/15 text-accent" : "text-text-tertiary hover:bg-accent/5 hover:text-text-secondary"}`}
              title="Thumbnail view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded cursor-pointer transition-colors duration-150 ${viewMode === "list" ? "bg-accent/15 text-accent" : "text-text-tertiary hover:bg-accent/5 hover:text-text-secondary"}`}
              title="List view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5 text-center">
            <p className="text-sm text-text-secondary">No recent projects yet.</p>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Favorites and pinned projects
              <br />
              will also appear here.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2">
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-1"}>
              {projects.map((proj) => {
                const firstImagePanel = proj.panels.find((p) => p.imageUrl);
                const thumbnailSrc = firstImagePanel ? firstImagePanel.imageUrl : null;
                const onSelect = () => handleSelectProject(proj);

                if (viewMode === "grid") {
                  return (
                    <ProjectCard
                      key={proj.id}
                      project={proj}
                      thumbnailSrc={thumbnailSrc}
                      onSelect={onSelect}
                      {...sharedItemProps}
                    />
                  );
                }

                return (
                  <ProjectRow
                    key={proj.id}
                    project={proj}
                    thumbnailSrc={thumbnailSrc}
                    onSelect={onSelect}
                    {...sharedItemProps}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div
        className="w-1.5 shrink-0 cursor-col-resize bg-transparent hover:bg-accent/20 active:bg-accent/35 transition-colors duration-150"
        onMouseDown={onMouseDown}
      />
    </div>
  );
}
