/**
 * Pure SVG path generation utilities for speech bubbles and backdrops.
 */

/** Generates a plain rectangle path (no roundedness, no border). */
export function rectPath(w: number, h: number): string {
  return `M 0 0 H ${w} V ${h} H 0 Z`;
}

/**
 * Generates a standard rounded rectangle path.
 */
export function roundedRectPath(w: number, h: number, r: number): string {
  const radius = Math.min(r, w / 2, h / 2);
  return [
    `M ${radius} 0`,
    `H ${w - radius}`,
    `A ${radius} ${radius} 0 0 1 ${w} ${radius}`,
    `V ${h - radius}`,
    `A ${radius} ${radius} 0 0 1 ${w - radius} ${h}`,
    `H ${radius}`,
    `A ${radius} ${radius} 0 0 1 0 ${h - radius}`,
    `V ${radius}`,
    `A ${radius} ${radius} 0 0 1 ${radius} 0`,
    `Z`
  ].join(" ");
}

/**
 * Generates a pill path (radius equal to half of height).
 */
export function pillPath(w: number, h: number): string {
  return roundedRectPath(w, h, h / 2);
}

/**
 * Generates a jagged action-burst (spiky speech bubble) path.
 */
export function actionBurstPath(w: number, h: number): string {
  const pts = actionBurstPoints(0, 0, w, h);
  const parts = pts.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`);
  parts.push("Z");
  return parts.join(" ");
}

export type BackdropShapeType = "rect" | "pill" | "rounded-rectangle" | "action-burst";

/** Dispatches to the correct backdrop path generator for a shape type. */
export function getBackdropPath(
  shapeType: BackdropShapeType,
  width: number,
  height: number,
  borderRadius: number
): string {
  if (width <= 0 || height <= 0) return "";
  if (shapeType === "pill") return pillPath(width, height);
  if (shapeType === "action-burst") return actionBurstPath(width, height);
  if (shapeType === "rect") return rectPath(width, height);
  return roundedRectPath(width, height, borderRadius);
}

/**
 * Finds the nearest point on a rectangle's perimeter to a given anchor point.
 * Coordinates are relative to the rectangle's top-left corner (0,0).
 */
export function getPerimeterPoint(w: number, h: number, anchorX: number, anchorY: number): { x: number; y: number } {
  const cx = w / 2;
  const cy = h / 2;

  // Vector from center to anchor
  const dx = anchorX - cx;
  const dy = anchorY - cy;

  if (dx === 0 && dy === 0) return { x: cx, y: 0 };

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Check which edge the ray intersects first
  if (w * absDy > h * absDx) {
    // Intersects top or bottom
    const y = dy > 0 ? h : 0;
    const x = cx + (dx * (y - cy)) / dy;
    return { x: Math.max(0, Math.min(w, x)), y };
  } else {
    // Intersects left or right
    const x = dx > 0 ? w : 0;
    const y = cy + (dy * (x - cx)) / dx;
    return { x, y: Math.max(0, Math.min(h, y)) };
  }
}

/**
 * Generates a secondary SVG path representing a speech bubble tail.
 * Starts near the perimeter point, extends to the tailAnchor, and returns to the perimeter.
 */
export function tailPath(w: number, h: number, anchorX: number, anchorY: number): string {
  const pts = tailPoints(w, h, anchorX, anchorY, 0, 0);
  return [
    `M ${pts[0][0]} ${pts[0][1]}`,
    `L ${pts[1][0]} ${pts[1][1]}`,
    `L ${pts[2][0]} ${pts[2][1]}`,
    `Z`
  ].join(" ");
}

export type Point2D = [number, number];

export function discretizeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, steps = 8): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    points.push([
      cx + r * Math.cos(angle),
      cy + r * Math.sin(angle)
    ]);
  }
  return points;
}

export function rectPoints(x: number, y: number, w: number, h: number): Point2D[] {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h]
  ];
}

export function roundedRectPoints(x: number, y: number, w: number, h: number, r: number): Point2D[] {
  const radius = Math.min(r, w / 2, h / 2);
  if (radius <= 0) {
    return rectPoints(x, y, w, h);
  }

  const steps = 8;
  const topRight = discretizeArc(x + w - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI, steps);
  const bottomRight = discretizeArc(x + w - radius, y + h - radius, radius, 0, 0.5 * Math.PI, steps);
  const bottomLeft = discretizeArc(x + radius, y + h - radius, radius, 0.5 * Math.PI, Math.PI, steps);
  const topLeft = discretizeArc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI, steps);

  const points: Point2D[] = [];
  points.push(...topRight.slice(0, -1));
  points.push(...bottomRight.slice(0, -1));
  points.push(...bottomLeft.slice(0, -1));
  points.push(...topLeft.slice(0, -1));
  return points;
}

export function actionBurstPoints(x: number, y: number, w: number, h: number): Point2D[] {
  const points: Point2D[] = [];
  const spikes = 16;
  const rx = w / 2;
  const ry = h / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;

  for (let i = 0; i < spikes; i++) {
    const angle = (i * 2 * Math.PI) / spikes;
    const nextAngle = ((i + 0.5) * 2 * Math.PI) / spikes;

    // Outer spike vertex
    points.push([
      cx + rx * Math.cos(angle),
      cy + ry * Math.sin(angle)
    ]);

    // Inner valley vertex
    points.push([
      cx + rx * 0.85 * Math.cos(nextAngle),
      cy + ry * 0.85 * Math.sin(nextAngle)
    ]);
  }

  return points;
}

export function tailPoints(
  w: number,
  h: number,
  anchorX: number,
  anchorY: number,
  gLeft = 0,
  gTop = 0
): Point2D[] {
  const start = getPerimeterPoint(w, h, anchorX, anchorY);
  
  const cx = w / 2;
  const cy = h / 2;
  const dx = anchorX - cx;
  const dy = anchorY - cy;
  
  const baseSize = 16;
  let p2x = start.x;
  let p2y = start.y;

  if (start.y === 0 || start.y === h) {
    p2x = start.x + (dx > 0 ? -baseSize : baseSize);
    p2x = Math.max(0, Math.min(w, p2x));
  } else {
    p2y = start.y + (dy > 0 ? -baseSize : baseSize);
    p2y = Math.max(0, Math.min(h, p2y));
  }

  return [
    [start.x + gLeft, start.y + gTop],
    [anchorX + gLeft, anchorY + gTop],
    [p2x + gLeft, p2y + gTop]
  ];
}
