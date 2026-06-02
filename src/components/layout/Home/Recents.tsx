"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";
import WPanelImage from "@/components/canvas/WPanel/WPanelImage";

const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 340; // Wider default sidebar to fit thumbnails

export default function Recents() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid"); // Default to thumbnail grid
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects || []);
  const setProject = useProjectStore((s) => s.setProject);

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

  return (
    <div
      className="h-full border border-border-default bg-surface rounded-lg flex overflow-hidden select-none flex-shrink-0"
      style={{ width }}
    >
      {/* Panel content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Section label & View Toggle */}
        <div className="px-4 pt-4 pb-3 border-b border-border-subtle flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Recents
          </p>
          <div className="flex gap-1">
            {/* Grid View Toggle */}
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
            {/* List View Toggle */}
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

        {/* Project List / Empty State */}
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

                if (viewMode === "grid") {
                  return (
                    <div
                      key={proj.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setProject(proj);
                        router.push("/workspace");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setProject(proj);
                          router.push("/workspace");
                        }
                      }}
                      className="group flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-background-hover hover:bg-accent/5 transition-all duration-150 cursor-pointer border border-transparent hover:border-accent/10 text-center"
                    >
                      {/* Large Thumbnail or Project File Icon */}
                      {thumbnailSrc ? (
                        <WPanelImage
                          imageUrl={thumbnailSrc}
                          className="w-28 h-28 rounded-md object-cover border border-border-subtle group-hover:border-accent/40 transition-colors duration-150 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-md border border-border-default flex items-center justify-center bg-background group-hover:border-accent/40 transition-colors duration-150">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-text-tertiary group-hover:text-accent transition-colors duration-150 flex-shrink-0">
                            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3H19ZM19 19H5V5H19V19Z" fill="currentColor"/>
                            <path d="M7 12H17V14H7V12Z" fill="currentColor"/>
                            <path d="M7 7H17V9H7V7Z" fill="currentColor"/>
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0 w-full">
                        <p className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 truncate">
                          {proj.name}
                        </p>
                        <p className="text-[10px] text-text-tertiary truncate">
                          {proj.panels.length} {proj.panels.length === 1 ? "panel" : "panels"}
                        </p>
                      </div>
                    </div>
                  );
                }

                // List View Mode
                return (
                  <div
                    key={proj.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setProject(proj);
                      router.push("/workspace");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setProject(proj);
                        router.push("/workspace");
                      }
                    }}
                    className="group w-full text-left p-3 rounded-lg hover:bg-background-hover hover:bg-accent/5 transition-all duration-150 cursor-pointer border border-transparent hover:border-accent/10"
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail or Project Icon */}
                      {thumbnailSrc ? (
                        <WPanelImage
                          imageUrl={thumbnailSrc}
                          className="w-8 h-8 rounded object-cover border border-border-subtle group-hover:border-accent/40 transition-colors duration-150 flex-shrink-0"
                        />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-tertiary group-hover:text-accent transition-colors duration-150 flex-shrink-0">
                          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3H19ZM19 19H5V5H19V19Z" fill="currentColor"/>
                          <path d="M7 12H17V14H7V12Z" fill="currentColor"/>
                          <path d="M7 7H17V9H7V7Z" fill="currentColor"/>
                        </svg>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors duration-150 truncate">
                          {proj.name}
                        </p>
                        <p className="text-xs text-text-tertiary truncate">
                          {proj.panels.length} {proj.panels.length === 1 ? "panel" : "panels"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        className="w-1.5 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-accent/20 active:bg-accent/35 transition-colors duration-150"
        onMouseDown={onMouseDown}
      />
    </div>
  );
}
