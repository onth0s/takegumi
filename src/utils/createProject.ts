import type { WProject, WPanel, WTextGroup, WTextBlock } from "@/types/canvas";
import {
  DEFAULT_PANEL_WIDTH,
  DEFAULT_PANEL_HEIGHT,
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_SHAPE_TYPE,
  DEFAULT_WTB_FONT_SIZE,
  DEFAULT_WTB_FONT_WEIGHT,
  DEFAULT_WTB_COLOR,
  DEFAULT_WTB_TEXT_ALIGN,
  DEFAULT_WTB_OPACITY,
} from "@/constants/canvasDefaults";
import { uid } from "@/utils/uid";

/** Default WTextBlock — a single "Text Block" entry for a fresh panel. */
function createDefaultBlock(): WTextBlock {
  return {
    id: uid(),
    text: "Text Block",
    style: {
      fontSize: DEFAULT_WTB_FONT_SIZE,
      fontWeight: DEFAULT_WTB_FONT_WEIGHT,
      color: DEFAULT_WTB_COLOR,
      textAlign: DEFAULT_WTB_TEXT_ALIGN,
      opacity: DEFAULT_WTB_OPACITY,
    },
  };
}

/**
 * Default WTextGroup — one group pre-seeded with a single default block.
 * `x` and `y` must always be passed explicitly (relative to the parent panel).
 */
function createDefaultTextGroup(x: number, y: number): WTextGroup {
  return {
    id: uid(),
    x,
    y,
    style: {
      opacity: DEFAULT_WTG_OPACITY,
      backgroundColor: DEFAULT_WTG_BACKGROUND_COLOR,
      borderRadius: DEFAULT_WTG_BORDER_RADIUS,
      borderWidth: DEFAULT_WTG_BORDER_WIDTH,
      shapeType: DEFAULT_WTG_SHAPE_TYPE,
    },
    tailAnchor: null,
    blocks: [createDefaultBlock()],
  };
}

/**
 * Creates a blank WPanel with sensible defaults.
 * `overrides` is typed as Partial<WPanel> and spread last — TypeScript enforces
 * that every key in `overrides` belongs to WPanel, so there is no silent field
 * mismatch. The spread lets callers (e.g. "duplicate panel") selectively override
 * id, imageUrl, position, etc. without reconstructing the full object.
 */
export function createBlankPanel(overrides?: Partial<WPanel>): WPanel {
  const width = overrides?.width ?? DEFAULT_PANEL_WIDTH;
  const height = overrides?.height ?? DEFAULT_PANEL_HEIGHT;
  return {
    id: uid(),
    imageUrl: null,
    x: 0,
    y: 0,
    width,
    height,
    textGroups: [createDefaultTextGroup(width / 2, height / 2)],
    style: {},
    ...overrides,
  };
}

/** Creates a blank WProject with no panels — the empty stage. */
export function createBlankProject(name = "Untitled Project"): WProject {
  const now = new Date().toISOString();
  return {
    id: uid(),
    name,
    panels: [],
    createdAt: now,
    updatedAt: now,
  };
}
