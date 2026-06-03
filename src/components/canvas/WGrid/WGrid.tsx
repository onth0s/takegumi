"use client";
import { useLayoutEffect, useRef, useState } from "react";
import type { CanvasTheme } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";

interface WGridProps {
  gridSize: number;
  canvasTheme: CanvasTheme;
}

const MINOR_LINE_WIDTH = 1;
const MAJOR_LINE_WIDTH = 1.5;
const MAJOR_INTERVAL = 4;

function lineColors(theme: CanvasTheme): { minor: string; major: string } {
  if (theme === "dark") {
    return { minor: "rgba(255,255,255,0.15)", major: "rgba(255,255,255,0.28)" };
  }
  return { minor: "rgba(0,0,0,0.12)", major: "rgba(0,0,0,0.22)" };
}

export default function WGrid({ gridSize, canvasTheme }: WGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const panelCount = useProjectStore((s) => s.project?.panels.length ?? 0);

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    let rafId = 0;
    const update = () => setHeight(parent.scrollHeight);
    const scheduleUpdate = () => { rafId = requestAnimationFrame(update); };
    update();
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(parent);
    const mutationObserver = new MutationObserver(scheduleUpdate);
    mutationObserver.observe(parent, { childList: true, subtree: true });
    parent.addEventListener("load", scheduleUpdate, true);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      parent.removeEventListener("load", scheduleUpdate, true);
    };
  }, [gridSize, panelCount]);

  if (gridSize < 1) return null;

  const colors = lineColors(canvasTheme);
  const majorSize = gridSize * MAJOR_INTERVAL;
  const minorId = `wgrid-minor-${gridSize}`;
  const majorId = `wgrid-major-${gridSize}`;

  return (
    <div
      ref={ref}
      className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1, height }}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={minorId} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <path
              d={`M ${gridSize} 0 L ${gridSize} ${gridSize} L 0 ${gridSize}`}
              fill="none"
              stroke={colors.minor}
              strokeWidth={MINOR_LINE_WIDTH}
            />
          </pattern>
          <pattern id={majorId} width={majorSize} height={majorSize} patternUnits="userSpaceOnUse">
            <path
              d={`M ${majorSize} 0 L ${majorSize} ${majorSize} L 0 ${majorSize}`}
              fill="none"
              stroke={colors.major}
              strokeWidth={MAJOR_LINE_WIDTH}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${minorId})`} />
        <rect width="100%" height="100%" fill={`url(#${majorId})`} />
      </svg>
    </div>
  );
}
