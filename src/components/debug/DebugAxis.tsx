"use client";
import { useState, useCallback, useRef } from "react";
import { useSnapping } from "@/hooks/useSnapping";

const CROSSHAIR_SIZE = 24;
const DOT_RADIUS = 4;

export default function DebugAxis() {
  const { snapValue, snapEnabled, effectiveThreshold, gridSize } = useSnapping();
  const [pos, setPos] = useState({ x: 400, y: 300 });
  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    origin.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - origin.current.x;
      const dy = e.clientY - origin.current.y;
      setPos((prev) => {
        const rawX = prev.x + dx;
        const rawY = prev.y + dy;
        origin.current = { x: e.clientX, y: e.clientY };
        if (snapEnabled) {
          return { x: snapValue(rawX), y: snapValue(rawY) };
        }
        return { x: rawX, y: rawY };
      });
    },
    [snapEnabled, snapValue]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const isSnapped = snapEnabled && pos.x % gridSize === 0 && pos.y % gridSize === 0;
  const dotColor = isSnapped ? "#22c55e" : "#6b7280";

  return (
    <div
      className="absolute z-50 cursor-grab active:cursor-grabbing select-none"
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Horizontal line */}
      <svg
        width={600}
        height={CROSSHAIR_SIZE}
        className="absolute pointer-events-none"
        style={{ left: -300, top: -CROSSHAIR_SIZE / 2 }}
      >
        <line
          x1={0} y1={CROSSHAIR_SIZE / 2}
          x2={300 - DOT_RADIUS - 2} y2={CROSSHAIR_SIZE / 2}
          stroke={dotColor}
          strokeWidth={1}
          opacity={0.6}
        />
        <line
          x1={300 + DOT_RADIUS + 2} y1={CROSSHAIR_SIZE / 2}
          x2={600} y2={CROSSHAIR_SIZE / 2}
          stroke={dotColor}
          strokeWidth={1}
          opacity={0.6}
        />
      </svg>

      {/* Vertical line */}
      <svg
        width={CROSSHAIR_SIZE}
        height={400}
        className="absolute pointer-events-none"
        style={{ left: -CROSSHAIR_SIZE / 2, top: -200 }}
      >
        <line
          x1={CROSSHAIR_SIZE / 2} y1={0}
          x2={CROSSHAIR_SIZE / 2} y2={200 - DOT_RADIUS - 2}
          stroke={dotColor}
          strokeWidth={1}
          opacity={0.6}
        />
        <line
          x1={CROSSHAIR_SIZE / 2} y1={200 + DOT_RADIUS + 2}
          x2={CROSSHAIR_SIZE / 2} y2={400}
          stroke={dotColor}
          strokeWidth={1}
          opacity={0.6}
        />
      </svg>

      {/* Center dot */}
      <svg
        width={DOT_RADIUS * 2 + 4}
        height={DOT_RADIUS * 2 + 4}
        className="absolute pointer-events-none"
        style={{ left: -(DOT_RADIUS + 2), top: -(DOT_RADIUS + 2) }}
      >
        <circle
          cx={DOT_RADIUS + 2}
          cy={DOT_RADIUS + 2}
          r={DOT_RADIUS}
          fill={dotColor}
        />
      </svg>

      {/* Coordinate label */}
      <div
        className="absolute pointer-events-none text-[10px] font-mono leading-none"
        style={{
          left: 14,
          top: 14,
          color: dotColor,
          background: "rgba(0,0,0,0.65)",
          padding: "2px 5px",
          borderRadius: 3,
          whiteSpace: "nowrap",
        }}
      >
        {pos.x},{pos.y}
        {snapEnabled && (
          <span className="ml-1 opacity-50">@{effectiveThreshold}px</span>
        )}
      </div>
    </div>
  );
}
