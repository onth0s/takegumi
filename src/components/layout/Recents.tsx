"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const MIN_WIDTH = 180;
const MAX_WIDTH = 520;
const DEFAULT_WIDTH = 280;

export default function Recents() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

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
        {/* Section label */}
        <div className="px-4 pt-4 pb-3 border-b border-border-subtle">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Recents
          </p>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5 text-center">
          <p className="text-sm text-text-secondary">No recent projects yet.</p>
          <p className="text-xs text-text-tertiary leading-relaxed">
            Favorites and pinned projects
            <br />
            will also appear here.
          </p>
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="w-1.5 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-accent/20 active:bg-accent/35 transition-colors duration-150"
        onMouseDown={onMouseDown}
      />
    </div>
  );
}
