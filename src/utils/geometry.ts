export interface SimpleRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Checks if a group's local rect overlaps the panel boundary.
 */
export function rectsOverlap(
  rect: SimpleRect,
  panelWidth: number,
  panelHeight: number
): boolean {
  return (
    rect.left < panelWidth &&
    rect.right > 0 &&
    rect.top < panelHeight &&
    rect.bottom > 0
  );
}
