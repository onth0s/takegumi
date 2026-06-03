"use client";
import { useRef, useState, useEffect } from "react";
import type { CanvasTheme } from "@/types/canvas";

interface WGridProps {
  gridSize: number;
  canvasTheme: CanvasTheme;
}

const MINOR_LINE_WIDTH = 1;
const MAJOR_LINE_WIDTH = 1.5;
const MAJOR_INTERVAL = 4;

function lineColors(
  theme: CanvasTheme
): { minor: string; major: string } {
  if (theme === "dark") {
    return { minor: "rgba(255,255,255,0.15)", major: "rgba(255,255,255,0.28)" };
  }
  return { minor: "rgba(0,0,0,0.12)", major: "rgba(0,0,0,0.22)" };
}

export default function WGrid({ gridSize, canvasTheme }: WGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (size.width === 0 || size.height === 0 || gridSize < 1) return null;

  const colors = lineColors(canvasTheme);
  const majorSize = gridSize * MAJOR_INTERVAL;

  return (
    <div
      ref={parentRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      <svg
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Minor grid pattern — single cell */}
          <pattern
            id="wgrid-minor"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L ${gridSize} ${gridSize} L 0 ${gridSize}`}
              fill="none"
              stroke={colors.minor}
              strokeWidth={MINOR_LINE_WIDTH}
            />
          </pattern>

          {/* Major grid pattern — 4×4 cell block */}
          <pattern
            id="wgrid-major"
            width={majorSize}
            height={majorSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${majorSize} 0 L ${majorSize} ${majorSize} L 0 ${majorSize}`}
              fill="none"
              stroke={colors.major}
              strokeWidth={MAJOR_LINE_WIDTH}
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#wgrid-minor)" />
        <rect width="100%" height="100%" fill="url(#wgrid-major)" />
      </svg>
    </div>
  );
}
