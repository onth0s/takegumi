import type { WProject, WPanel, WTextGroup, WTextBlock } from "@/types/canvas";

/** Thin wrapper around crypto.randomUUID — available in all modern browsers and Node ≥19. */
function uid(): string {
  return crypto.randomUUID();
}

/** Default WTextBlock — a single "Text Block" entry for a fresh panel. */
function createDefaultBlock(): WTextBlock {
  return {
    id: uid(),
    text: "Text Block",
    style: {
      fontSize: 24,
      fontWeight: "700",
      color: "#ffffff",
      textAlign: "center",
    },
  };
}

/** Default WTextGroup — one group pre-seeded with a single default block. */
function createDefaultTextGroup(x = 320, y = 240): WTextGroup {
  return {
    id: uid(),
    x,
    y,
    width: 0,  // computed by useWPath in Phase 2
    height: 0, // computed by useWPath in Phase 2
    style: {
      opacity: 0.5,
      backgroundColor: "#000000",
      borderRadius: 8,
      borderWidth: 0,
      shapeType: "rounded-rectangle",
    },
    tailAnchor: null,
    blocks: [createDefaultBlock()],
  };
}

/**
 * Creates a blank WPanel with sensible defaults.
 * `overrides` is typed as Partial<WPanel> and spread last — TypeScript enforces
 * that every key in `overrides` belongs to WPanel, so there is no silent field
 * mismatch. The spread is not pointless: it lets callers (e.g. a future
 * "duplicate panel" action) selectively override id, imageUrl, position, etc.
 * without having to reconstruct the full object.
 */
export function createBlankPanel(overrides?: Partial<WPanel>): WPanel {
  const width = overrides?.width ?? 640;
  const height = overrides?.height ?? 480;
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
