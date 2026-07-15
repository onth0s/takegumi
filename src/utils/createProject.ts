import type { WProject, WPanel, WTextGroup, WTextBlock } from "@/types/canvas";
import {
  DEFAULT_PANEL_WIDTH,
  DEFAULT_PANEL_HEIGHT,
  DEFAULT_PANEL_BORDER_ENABLED,
  DEFAULT_PANEL_BORDER_COLOR,
  DEFAULT_PANEL_BORDER_WIDTH,
  DEFAULT_PANEL_DISABLE_SYNTHETIC_BORDER,
  DEFAULT_WTG_BACKGROUND_COLOR,
  DEFAULT_WTG_OPACITY,
  DEFAULT_WTG_WIDTH,
  DEFAULT_WTG_HEIGHT,
  DEFAULT_WTG_BORDER_RADIUS,
  DEFAULT_WTG_BORDER_WIDTH,
  DEFAULT_WTG_BORDER_COLOR,
  DEFAULT_WTG_BORDER_OPACITY,
  DEFAULT_WTG_SHAPE_TYPE,
  DEFAULT_WTB_FONT_SIZE,
  DEFAULT_WTB_FONT_WEIGHT,
  DEFAULT_WTB_COLOR,
  DEFAULT_WTB_TEXT_ALIGN,
  DEFAULT_WTB_OPACITY,
  DEFAULT_GRID_SIZE,
  DEFAULT_GRID_SNAP_ENABLED,
  DEFAULT_GRID_SHOW_GRID,
  DEFAULT_CANVAS_THEME,
} from "@/constants/canvasDefaults";
import {
  computeDefaultPanelPercent,
  percentToPanelX,
} from "@/constants/layout";
import { uid } from "@/utils/uid";

/** Default WTextBlock — a single "Text Block" entry for a fresh panel. */
export function createTextBlock(overrides?: Partial<WTextBlock>): WTextBlock {
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
    ...overrides,
  };
}

/**
 * Default WTextGroup — one group pre-seeded with a single default block.
 * `x` and `y` must always be passed explicitly (relative to the parent panel).
 */
export function createTextGroup(x: number, y: number, overrides?: Partial<WTextGroup>): WTextGroup {
  return {
    id: uid(),
    x,
    y,
    style: {
      opacity: DEFAULT_WTG_OPACITY,
      backgroundColor: DEFAULT_WTG_BACKGROUND_COLOR,
      width: DEFAULT_WTG_WIDTH,
      height: DEFAULT_WTG_HEIGHT,
      borderRadius: DEFAULT_WTG_BORDER_RADIUS,
      borderWidth: DEFAULT_WTG_BORDER_WIDTH,
      borderColor: DEFAULT_WTG_BORDER_COLOR,
      borderOpacity: DEFAULT_WTG_BORDER_OPACITY,
      shapeType: DEFAULT_WTG_SHAPE_TYPE,
    },
    tailAnchor: null,
    blocks: [createTextBlock()],
    ...overrides,
  };
}

/**
 * Creates a blank WPanel with sensible defaults.
 * `overrides` is typed as Partial<WPanel> and spread last — TypeScript enforces
 * that every key in `overrides` belongs to WPanel, so there is no silent field
 * mismatch. The spread lets callers (e.g. "duplicate panel") selectively override
 * id, imageUrl, position, etc. without reconstructing the full object.
 *
 * When `existingPanels` is provided, the panel's x-position is derived from the
 * layout of prior panels (see {@link computeDefaultPanelPercent}) instead of
 * defaulting to centered. Explicitly passing `x` in `overrides` still takes
 * precedence.
 */
export function createBlankPanel(overrides?: Partial<WPanel>, existingPanels?: WPanel[]): WPanel {
  const width = overrides?.width ?? DEFAULT_PANEL_WIDTH;
  const height = overrides?.height ?? DEFAULT_PANEL_HEIGHT;

  let x: number;
  if (overrides?.x !== undefined) {
    x = overrides.x;
  } else if (existingPanels) {
    const percent = computeDefaultPanelPercent(existingPanels);
    x = percentToPanelX(percent, width);
  } else {
    x = percentToPanelX(50, width);
  }

  let y = overrides?.y ?? 0;
  if (overrides?.y === undefined && existingPanels && existingPanels.length > 0) {
    // Stack below the lowest panel bottom edge, with 40px spacing
    const lowestY = Math.max(...existingPanels.map((p) => p.y + p.height));
    y = lowestY + 40;
  }

  return {
    id: uid(),
    imageUrl: null,
    x,
    y,
    width,
    height,
    borderEnabled: DEFAULT_PANEL_BORDER_ENABLED,
    borderColor: DEFAULT_PANEL_BORDER_COLOR,
    borderWidth: DEFAULT_PANEL_BORDER_WIDTH,
    disableSyntheticBorder: DEFAULT_PANEL_DISABLE_SYNTHETIC_BORDER,
    zIndex: overrides?.zIndex ?? existingPanels?.length ?? 0,
    textGroups: [createTextGroup(x + width / 2, y + height / 2)],
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
    grid: {
      size: DEFAULT_GRID_SIZE,
      snapEnabled: DEFAULT_GRID_SNAP_ENABLED,
      showGrid: DEFAULT_GRID_SHOW_GRID,
    },
    canvasTheme: DEFAULT_CANVAS_THEME,
    disableSyntheticBorder: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Creates a demo WProject with pre-populated panels and text groups. */
export function createDemoProject(): WProject {
  const now = new Date().toISOString();
  const proj: WProject = {
    id: uid(),
    name: "Takegumi Demo Story",
    grid: {
      size: 10,
      snapEnabled: true,
      showGrid: true,
    },
    canvasTheme: "light",
    disableSyntheticBorder: false,
    createdAt: now,
    updatedAt: now,
    panels: [],
  };

  const p1 = createBlankPanel({ width: 480, height: 320, borderEnabled: true, y: 40 }, proj.panels);
  // Clear default auto-created text group so we can customize it
  p1.textGroups = [];
  const tg1 = createTextGroup(p1.x + 240, p1.y + 160);
  tg1.blocks = [
    createTextBlock({ text: "A long time ago..." }),
  ];
  p1.textGroups.push(tg1);
  proj.panels.push(p1);

  const p2 = createBlankPanel({ width: 640, height: 400, borderEnabled: true, y: 400 }, proj.panels);
  p2.textGroups = [];
  const tg2 = createTextGroup(p2.x + 320, p2.y + 200);
  tg2.blocks = [
    createTextBlock({ text: "In a webtoon editor far, far away..." }),
  ];
  p2.textGroups.push(tg2);
  proj.panels.push(p2);

  return proj;
}
