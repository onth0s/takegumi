"use client";
import type { CanvasTheme } from "@/types/canvas";

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
  if (gridSize < 1) return null;

  const colors = lineColors(canvasTheme);
  const majorSize = gridSize * MAJOR_INTERVAL;
  const minorId = `wgrid-minor-${gridSize}`;
  const majorId = `wgrid-major-${gridSize}`;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
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
