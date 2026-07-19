"use client";
import { useState, useCallback, useRef } from "react";
import { useSnapping } from "@/hooks/useSnapping";

const ARM_LENGTH = 40;
const DOT_RADIUS = 4;
const HIT_SIZE = 28;

export default function DebugAxis() {
  const { snapValue, snapEnabled, effectiveThreshold, gridSize } = useSnapping();
  const [pos, setPos] = useState({ x: 400, y: 300 });
  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const rawPos = useRef({ x: 400, y: 300 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    origin.current = { x: e.clientX, y: e.clientY };
    rawPos.current = { ...pos };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.x, pos.y]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - origin.current.x;
      const dy = e.clientY - origin.current.y;
      origin.current = { x: e.clientX, y: e.clientY };
      rawPos.current.x += dx;
      rawPos.current.y += dy;
      if (snapEnabled) {
        setPos({ x: snapValue(rawPos.current.x), y: snapValue(rawPos.current.y) });
      } else {
        setPos({ x: rawPos.current.x, y: rawPos.current.y });
      }
    },
    [snapEnabled, snapValue]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const isSnapped = snapEnabled && pos.x % gridSize === 0 && pos.y % gridSize === 0;
  const dotColor = isSnapped ? "#22c55e" : "#6b7280";
  const halfArm = ARM_LENGTH;

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      className="absolute z-50 cursor-grab active:cursor-grabbing select-none"
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Invisible hit target */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: -HIT_SIZE / 2,
          top: -HIT_SIZE / 2,
          width: HIT_SIZE,
          height: HIT_SIZE,
          borderRadius: "50%",
        }}
      />

      {/* Axis lines — single SVG */}
      <svg
        width={ARM_LENGTH * 2}
        height={ARM_LENGTH * 2}
        className="absolute pointer-events-none"
        style={{ left: -halfArm, top: -halfArm }}
      >
        {/* Horizontal line */}
        <line
          x1={0} y1={halfArm}
          x2={halfArm - DOT_RADIUS - 2} y2={halfArm}
          stroke={dotColor}
          strokeWidth={1}
          opacity={0.7}
        />
        <line
          x1={halfArm + DOT_RADIUS + 2} y1={halfArm}
          x2={ARM_LENGTH * 2} y2={halfArm}
          stroke={dotColor}
          strokeWidth={1}
          opacity={0.7}
        />

        {/* Vertical line */}
        <line
          x1={halfArm} y1={0}
          x2={halfArm} y2={halfArm - DOT_RADIUS - 2}
          stroke={dotColor}
          strokeWidth={1}
          opacity={0.7}
        />
        <line
          x1={halfArm} y1={halfArm + DOT_RADIUS + 2}
          x2={halfArm} y2={ARM_LENGTH * 2}
          stroke={dotColor}
          strokeWidth={1}
          opacity={0.7}
        />

        {/* Center dot */}
        <circle
          cx={halfArm}
          cy={halfArm}
          r={DOT_RADIUS}
          fill={dotColor}
        />
      </svg>

      {/* Coordinate label */}
      <div
        className="absolute pointer-events-none text-[10px] font-mono leading-none"
        style={{
          left: halfArm + 2,
          top: halfArm + 2,
          color: dotColor,
          background: "rgba(0,0,0,0.7)",
          padding: "2px 5px",
          borderRadius: 3,
          whiteSpace: "nowrap",
        }}
      >
        {pos.x},{pos.y}
        {snapEnabled && (
          <span className="ml-1 opacity-60">@{effectiveThreshold}px</span>
        )}
      </div>
    </div>
  );
}
