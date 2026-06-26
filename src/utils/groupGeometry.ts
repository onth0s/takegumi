export interface LocalRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * Computes a text group's bounding rectangle relative to its parent panel's top-left corner.
 */
export function getGroupLocalRect(
  group: { x: number; y: number },
  panelX: number,
  panelY: number,
  width: number,
  height: number
): LocalRect {
  const left = Math.round(group.x - width / 2 - panelX);
  const top = Math.round(group.y - height / 2 - panelY);
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
}
