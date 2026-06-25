"use client";

interface WBorderProps {
  pathD: string;
  borderColor: string;
  borderWidth: number;
  width: number;
  height: number;
}

export default function WBorder({
  pathD,
  borderColor,
  borderWidth,
  width,
  height,
}: WBorderProps) {
  if (!pathD) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10 overflow-visible"
      width={width}
      height={height}
    >
      <path
        d={pathD}
        stroke={borderColor}
        strokeWidth={borderWidth}
        fill="none"
        strokeLinecap="butt"
      />
    </svg>
  );
}
