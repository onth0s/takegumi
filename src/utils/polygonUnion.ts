import {
  rectPoints,
  roundedRectPoints,
  actionBurstPoints,
  tailPoints,
} from "./pathGenerators";

export type Point = [number, number];

export interface Segment {
  start: Point;
  end: Point;
}

/**
 * Discretize a speech tail.
 */
export function discretizeTail(
  w: number,
  h: number,
  anchorX: number,
  anchorY: number,
  gLeft: number,
  gTop: number
): Point[] {
  return tailPoints(w, h, anchorX, anchorY, gLeft, gTop);
}

/**
 * Discretize a rectangle.
 */
export function discretizeRect(x: number, y: number, w: number, h: number): Point[] {
  return rectPoints(x, y, w, h);
}

/**
 * Discretize a rounded rectangle.
 */
export function discretizeRoundedRect(x: number, y: number, w: number, h: number, r: number): Point[] {
  return roundedRectPoints(x, y, w, h, r);
}

/**
 * Discretize an action-burst shape.
 */
export function discretizeActionBurst(x: number, y: number, w: number, h: number): Point[] {
  return actionBurstPoints(x, y, w, h);
}

/**
 * Find intersection point between two line segments.
 */
export function getLineIntersection(
  p0_x: number, p0_y: number, p1_x: number, p1_y: number,
  p2_x: number, p2_y: number, p3_x: number, p3_y: number
): Point | null {
  const s1_x = p1_x - p0_x;
  const s1_y = p1_y - p0_y;
  const s2_x = p3_x - p2_x;
  const s2_y = p3_y - p2_y;

  const denom = -s2_x * s1_y + s1_x * s2_y;
  if (Math.abs(denom) < 1e-8) {
    return null; // Parallel or collinear
  }

  const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / denom;
  const t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / denom;

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return [p0_x + (t * s1_x), p0_y + (t * s1_y)];
  }
  return null;
}

/**
 * Point-in-polygon test using ray-casting.
 */
export function isPointInPolygon(point: Point, vs: Point[]): boolean {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Split polygon edges by intersection points with another polygon.
 */
export function splitPolygonEdges(poly1: Point[], poly2: Point[]): Segment[] {
  const segments: Segment[] = [];

  for (let i = 0; i < poly1.length; i++) {
    const p1 = poly1[i];
    const p2 = poly1[(i + 1) % poly1.length];

    const intersections: { pt: Point; t: number }[] = [];

    for (let j = 0; j < poly2.length; j++) {
      const q1 = poly2[j];
      const q2 = poly2[(j + 1) % poly2.length];

      const inter = getLineIntersection(p1[0], p1[1], p2[0], p2[1], q1[0], q1[1], q2[0], q2[1]);
      if (inter) {
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const t = (Math.abs(dx) > 1e-5) ? (inter[0] - p1[0]) / dx : (inter[1] - p1[1]) / dy;
        // Ignore endpoints slightly to prevent duplicate segment splits due to precision
        if (t > 0.001 && t < 0.999) {
          intersections.push({ pt: inter, t });
        }
      }
    }

    intersections.sort((a, b) => a.t - b.t);

    let currentStart = p1;
    for (const inter of intersections) {
      segments.push({ start: currentStart, end: inter.pt });
      currentStart = inter.pt;
    }
    segments.push({ start: currentStart, end: p2 });
  }

  return segments;
}

/**
 * Assemble split segments into closed loops.
 */
export function assemblePolygons(segments: Segment[]): Point[][] {
  const loops: Point[][] = [];
  const remaining = [...segments];
  const eps = 1.0; // 1 pixel tolerance for matching endpoints

  while (remaining.length > 0) {
    const loop: Point[] = [];
    const current = remaining.shift()!;
    loop.push(current.start);
    let currPoint = current.end;

    let foundNext = true;
    while (foundNext) {
      const idx = remaining.findIndex(seg =>
        Math.hypot(seg.start[0] - currPoint[0], seg.start[1] - currPoint[1]) < eps
      );

      if (idx !== -1) {
        const nextSeg = remaining.splice(idx, 1)[0];
        loop.push(nextSeg.start);
        currPoint = nextSeg.end;
      } else {
        const distToStart = Math.hypot(loop[0][0] - currPoint[0], loop[0][1] - currPoint[1]);
        if (distToStart < eps) {
          loop.push(loop[0]);
        } else {
          loop.push(currPoint);
        }
        foundNext = false;
      }
    }
    if (loop.length >= 3) {
      loops.push(loop);
    }
  }
  return loops;
}

/**
 * Compute the union of two polygons.
 */
export function unionTwoPolygons(polyA: Point[], polyB: Point[]): Point[][] {
  const perturbedB = polyB.map(p => [p[0] + 0.01, p[1] + 0.01] as Point);
  const segsA = splitPolygonEdges(polyA, perturbedB);
  const segsB = splitPolygonEdges(perturbedB, polyA);

  const keptSegs: Segment[] = [];

  for (const seg of segsA) {
    const mid: Point = [(seg.start[0] + seg.end[0]) / 2, (seg.start[1] + seg.end[1]) / 2];
    if (!isPointInPolygon(mid, perturbedB)) {
      keptSegs.push(seg);
    }
  }

  for (const seg of segsB) {
    const mid: Point = [(seg.start[0] + seg.end[0]) / 2, (seg.start[1] + seg.end[1]) / 2];
    if (!isPointInPolygon(mid, polyA)) {
      // Map back to unperturbed coordinates for output alignment
      const startUnperturbed: Point = [seg.start[0] - 0.01, seg.start[1] - 0.01];
      const endUnperturbed: Point = [seg.end[0] - 0.01, seg.end[1] - 0.01];
      keptSegs.push({ start: startUnperturbed, end: endUnperturbed });
    }
  }

  return assemblePolygons(keptSegs);
}

/**
 * Converts a polygon loop to an SVG path string.
 */
export function polygonToSVGPath(poly: Point[]): string {
  if (poly.length === 0) return "";
  let d = `M ${poly[0][0].toFixed(1)},${poly[0][1].toFixed(1)}`;
  for (let i = 1; i < poly.length; i++) {
    d += ` L ${poly[i][0].toFixed(1)},${poly[i][1].toFixed(1)}`;
  }
  d += " Z";
  return d;
}
