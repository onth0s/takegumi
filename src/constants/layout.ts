export const CANVAS_MAX_WIDTH = 960;
export const CANVAS_PADDING = 40;
export const GROUP_PADDING = 20;

export const DEFAULT_PANEL_WIDTH = CANVAS_MAX_WIDTH / 2;
export const DEFAULT_PANEL_HEIGHT = 480;
export const IMPORT_PANEL_WIDTH = CANVAS_MAX_WIDTH / 2;

export const MIN_PANEL_WIDTH_PERCENT = 10;
export const WTG_MAX_HEIGHT = 600;

function valClamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function xToPanelPercent(x: number, panelWidth: number): number {
  const maxX = CANVAS_MAX_WIDTH - panelWidth;
  if (maxX <= 0) return 50;
  return Math.round(valClamp((x / maxX) * 100, 0, 100));
}

export function percentToPanelX(percent: number, panelWidth: number): number {
  const maxX = CANVAS_MAX_WIDTH - panelWidth;
  return Math.round(valClamp((percent / 100) * maxX, 0, CANVAS_MAX_WIDTH));
}

export function computeDefaultPanelPercent(existingPanels: { x: number; width: number }[]): number {
  if (existingPanels.length === 0) return 50;

  const prev = existingPanels[existingPanels.length - 1];
  const prevPercent = xToPanelPercent(prev.x, prev.width);

  if (Math.abs(prevPercent - 50) < 1) return 50;
  if (prevPercent < 50) return Math.min(100, Math.round(prevPercent + 10));
  return Math.max(0, Math.round(prevPercent - 10));
}

export function widthToPercent(px: number): number {
  return Math.round(valClamp((px / CANVAS_MAX_WIDTH) * 100, MIN_PANEL_WIDTH_PERCENT, 100));
}

export function percentToWidth(percent: number): number {
  return Math.round(valClamp((percent / 100) * CANVAS_MAX_WIDTH, (MIN_PANEL_WIDTH_PERCENT / 100) * CANVAS_MAX_WIDTH, CANVAS_MAX_WIDTH));
}

export function wtgWidthToPercent(px: number): number {
  if (px === 0) return 0;
  return Math.round(valClamp((px / CANVAS_MAX_WIDTH) * 100, 1, 100));
}

export function wtgPercentToWidth(percent: number): number {
  if (percent === 0) return 0;
  return Math.round(valClamp((percent / 100) * CANVAS_MAX_WIDTH, 1, CANVAS_MAX_WIDTH));
}

export function wtgHeightToPercent(px: number): number {
  if (px === 0) return 0;
  return Math.round(valClamp((px / WTG_MAX_HEIGHT) * 100, 1, 100));
}

export function wtgPercentToHeight(percent: number): number {
  if (percent === 0) return 0;
  return Math.round(valClamp((percent / 100) * WTG_MAX_HEIGHT, 1, WTG_MAX_HEIGHT));
}
