import { CANVAS_MAX_WIDTH, MIN_PANEL_WIDTH_PERCENT, WTG_MAX_HEIGHT } from "@/constants/layout";

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

function valClamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Snap a raw X value to the nearest grid multiple.
 */
export function snapX(
  x: number,
  gridSize: number,
  snapEnabled: boolean,
  freeX: boolean | undefined,
  borderWidth: number = 0,
): number {
  if (!snapEnabled || freeX) return Math.round(x);
  const target = x + borderWidth;
  const snappedTarget = Math.round(target / gridSize) * gridSize;
  return snappedTarget - borderWidth;
}

/**
 * Snap a raw Y value to the nearest grid multiple.
 */
export function snapY(
  y: number,
  gridSize: number,
  snapEnabled: boolean,
  freeY: boolean | undefined,
  borderWidth: number = 0,
): number {
  if (!snapEnabled || freeY) return Math.round(y);
  const target = y + borderWidth;
  const snappedTarget = Math.round(target / gridSize) * gridSize;
  return snappedTarget - borderWidth;
}

/**
 * Snap a raw pixel width to the nearest grid multiple,
 * clamped to [minWidth, CANVAS_MAX_WIDTH].
 */
export function snapWidth(
  width: number,
  gridSize: number,
  snapEnabled: boolean,
  freeWidth: boolean | undefined,
  borderWidth: number = 0,
): number {
  const minWidth = (MIN_PANEL_WIDTH_PERCENT / 100) * CANVAS_MAX_WIDTH;
  if (!snapEnabled || freeWidth) {
    return Math.round(Math.min(CANVAS_MAX_WIDTH, Math.max(minWidth, width)));
  }
  const innerWidth = width - 2 * borderWidth;
  const snappedInner = Math.round(innerWidth / gridSize) * gridSize;
  const snapped = snappedInner + 2 * borderWidth;
  return Math.min(CANVAS_MAX_WIDTH, Math.max(minWidth, snapped));
}

export function snapGroupWidth(
  width: number,
  gridSize: number,
  snapEnabled: boolean,
  freeWidth: boolean | undefined,
): number {
  if (width === 0) return 0;
  if (!snapEnabled || freeWidth) {
    return Math.round(valClamp(width, 1, CANVAS_MAX_WIDTH));
  }
  const snapped = Math.round(width / gridSize) * gridSize;
  return Math.round(valClamp(snapped, gridSize, CANVAS_MAX_WIDTH));
}

export function snapGroupHeight(
  height: number,
  gridSize: number,
  snapEnabled: boolean,
  freeHeight: boolean | undefined,
): number {
  if (height === 0) return 0;
  if (!snapEnabled || freeHeight) {
    return Math.round(valClamp(height, 1, WTG_MAX_HEIGHT));
  }
  const snapped = Math.round(height / gridSize) * gridSize;
  return Math.round(valClamp(snapped, gridSize, WTG_MAX_HEIGHT));
}
