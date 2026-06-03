export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function snapValue(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapRect(rect: Rect, gridSize: number): Rect {
  return {
    x: snapValue(rect.x, gridSize),
    y: snapValue(rect.y, gridSize),
    width: snapValue(rect.width, gridSize),
    height: snapValue(rect.height, gridSize),
  };
}

/**
 * Computes the effective snap threshold, clamped to `gridSize / 2`
 * so a coordinate can never be within snapping range of two adjacent
 * grid lines simultaneously.
 */
export function effectiveSnapThreshold(rawThreshold: number, gridSize: number): number {
  return Math.min(rawThreshold, gridSize / 2);
}
