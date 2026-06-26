import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

interface WBorderProps {
  pathD: string;
  borderColor: string;
  borderWidth: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

export default function WBorder({
  pathD,
  borderColor,
  borderWidth,
  width,
  height,
  x,
  y,
}: WBorderProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!pathD || !isClient) return null;

  const target = document.getElementById("panel-borders-portal-target");
  if (!target) return null;

  return createPortal(
    <svg
      className="absolute pointer-events-none z-10 overflow-visible"
      width={width}
      height={height}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <path
        d={pathD}
        stroke={borderColor}
        strokeWidth={borderWidth}
        fill="none"
        strokeLinecap="butt"
      />
    </svg>,
    target
  );
}
