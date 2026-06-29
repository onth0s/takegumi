import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

interface MaskRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface WBorderProps {
  pathD: string;
  borderColor: string;
  borderWidth: number;
  width: number;
  height: number;
  x: number;
  y: number;
  panelId: string;
  maskRects?: MaskRect[];
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
  panelId,
  maskRects = [],
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

  const hasMask = maskRects.length > 0;
  const maskId = `border-mask-${panelId}`;
  // Oversized white rect so the mask covers the full stroke including overflow
  const pad = borderWidth * 2;

  return (
    <>
      {/* Synthetic border — low-z portal, above panel images but below WTGs.
          SVG mask punches out each WTG bounding box so the border is never
          visible behind a WTG. */}
      {pathD && borderTarget && createPortal(
        <svg
          className="absolute pointer-events-none overflow-visible"
          width={width}
          height={height}
          style={{ left: `${x}px`, top: `${y}px` }}
        >
          {hasMask && (
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
                {/* White = show the border */}
                <rect
                  x={-pad}
                  y={-pad}
                  width={width + pad * 2}
                  height={height + pad * 2}
                  fill="white"
                />
                {/* Black = hide the border where WTGs sit */}
                {maskRects.map((r, i) => (
                  <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="black" />
                ))}
              </mask>
            </defs>
          )}
          <path
            d={pathD}
            stroke={borderColor}
            strokeWidth={borderWidth}
            fill="none"
            strokeLinecap="square"
            mask={hasMask ? `url(#${maskId})` : undefined}
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
