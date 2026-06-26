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
  isSelected?: boolean;
  isHovered?: boolean;
}

export default function WBorder({
  pathD,
  borderColor,
  borderWidth,
  width,
  height,
  x,
  y,
  isSelected = false,
  isHovered = false,
}: WBorderProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) return null;

  const borderTarget = document.getElementById("panel-borders-portal-target");
  const selectionTarget = document.getElementById("panel-selection-portal-target");

  const ringStrokeWidth = isSelected ? 2 : 1;
  const ringColor = isSelected
    ? "var(--color-accent, #6366f1)"
    : "var(--color-border-default, #888)";
  const showRing = isSelected || isHovered;

  return (
    <>
      {/* Synthetic border — low-z portal, above panel images but below WTGs */}
      {pathD && borderTarget && createPortal(
        <svg
          className="absolute pointer-events-none overflow-visible"
          width={width}
          height={height}
          style={{ left: `${x}px`, top: `${y}px` }}
        >
          <path
            d={pathD}
            stroke={borderColor}
            strokeWidth={borderWidth}
            fill="none"
            strokeLinecap="square"
          />
        </svg>,
        borderTarget
      )}

      {/* Selection / hover ring — high-z portal, always on top of everything */}
      {showRing && selectionTarget && createPortal(
        <svg
          className="absolute pointer-events-none overflow-visible"
          width={width}
          height={height}
          style={{ left: `${x}px`, top: `${y}px` }}
        >
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="none"
            stroke={ringColor}
            strokeWidth={ringStrokeWidth}
          />
        </svg>,
        selectionTarget
      )}
    </>
  );
}
