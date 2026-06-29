"use client";
import { useCallback, useEffect, useRef } from "react";
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);

  const updateScrollbar = useCallback(() => {
    const container = scrollContainerRef.current;
    const thumb = scrollThumbRef.current;
    if (!container || !thumb) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollHeight <= clientHeight) {
      thumb.style.height = "0px";
      return;
    }

    const visibleRatio = clientHeight / scrollHeight;
    const trackHeight = clientHeight;
    const thumbHeight = Math.max(30, trackHeight * visibleRatio);

    const containerScrollable = scrollHeight - clientHeight;
    const thumbScrollable = trackHeight - thumbHeight;

    const scrollRatio = scrollTop / containerScrollable;
    const thumbTop = scrollRatio * thumbScrollable;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  }, []);

  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;

    const startY = e.clientY;
    const startScrollTop = container.scrollTop;
    const { scrollHeight, clientHeight } = container;

    const visibleRatio = clientHeight / scrollHeight;
    const trackHeight = clientHeight;
    const thumbHeight = Math.max(30, trackHeight * visibleRatio);
    const containerScrollable = scrollHeight - clientHeight;
    const thumbScrollable = trackHeight - thumbHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaTop = (deltaY / thumbScrollable) * containerScrollable;
      container.scrollTop = Math.max(0, Math.min(scrollHeight - clientHeight, startScrollTop + deltaTop));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("select-none");
    };

    document.body.classList.add("select-none");
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateScrollbar);

    const resizeObserver = new ResizeObserver(() => {
      updateScrollbar();
    });

    resizeObserver.observe(container);
    const content = container.firstElementChild;
    if (content) {
      resizeObserver.observe(content);
    }

    updateScrollbar();

    return () => {
      container.removeEventListener("scroll", updateScrollbar);
      resizeObserver.disconnect();
    };
  }, [hydrated, project, updateScrollbar]);

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
      className={`flex-1 h-full overflow-hidden relative ${
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
            <WProject project={project} scrollRef={scrollContainerRef} />
          </div>
        </div>

        {/* Synthetic Scrollbar */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/5 hover:bg-black/10 border-l border-black/5 dark:border-white/5 z-20 flex justify-center">
          <div
            ref={scrollThumbRef}
            className="w-1.5 bg-neutral-400/40 hover:bg-neutral-400/60 rounded-full cursor-pointer absolute top-0 transition-colors duration-150"
            style={{ height: 0 }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      </div>
    </div>
  );
}
