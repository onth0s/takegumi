# Implementation Plan: Per-Block Backgrounds (Design A)

## Goal

Add `backgroundColor` to `WTextBlock.style` so each text block within a `WTextGroup` can independently control its own backdrop — a colored bubble, or no backdrop at all (SFX mode). The existing unified group backdrop is preserved as the default for blocks that do not override it.

---

## Approved Design Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Option A — "Split" rendering** | Blocks without explicit `backgroundColor` inherit the group backdrop (unified envelope). Blocks WITH `backgroundColor` get their own individual SVG backdrop and are excluded from the group envelope. A falsy `backgroundColor` means no backdrop at all. |
| 2 | **Falsy = no backdrop** | `undefined`, `null`, `""`, or `"transparent"` → no backdrop rendered for that block. Simple, and gracefully handles corrupted input. |
| 3 | **Inherit shape from group** | Per-block backdrops use the group's `shapeType` and `borderRadius` as defaults. These may become independently configurable later. |
| 4 | **New shape: `"rect"`** | Add a fourth `shapeType` value — a plain rectangle with no roundedness and no border. `"rect"` produces a simple axis-aligned rect path. |
| 5 | **`block.style.backgroundOpacity`** | New property on WTB for per-block background opacity, independent of the block's text `opacity`. The alpha-preserving pipeline applies this to the backdrop layer only. |
| 6 | **Tail anchor → per-WTB** | The tail anchor target should be specifiable per block, not just per group. A group-level anchor applies when no block overrides it. |
| 7 | **Self-contained per-block rendering** | Each `WTextBlock` component renders its own SVG backdrop when `backgroundColor` is set, receiving shape/style params from the parent group. No need for a shared `useWPath` for individual blocks. |
| 8 | **Future: unified layer merging** | The compositing pipeline should eventually detect adjacent WTBs in the same group that share identical `backgroundColor` + `backgroundOpacity` and merge them into a single unified SVG backdrop layer. This plan does not implement this; it is noted for later optimization. |

---

## Implementation Steps (ordered)

### Phase 1 — Schema & Types

#### Step 1.1: `gnd/schemas/canvas.yaml`

Add to `WTextBlock.style`:

```yaml
backgroundColor:
  type: string
  description: >
    Backdrop fill color for this block. When falsy (undefined/null/empty/"transparent"),
    no backdrop is rendered — the block is text-only (SFX mode).
    When set, an individual SVG backdrop is rendered for this block using the
    parent group's shapeType/borderRadius as defaults.
  nullable: true
backgroundOpacity:
  type: number
  minimum: 0
  maximum: 1
  default: 1
  description: >
    Opacity of this block's individual backdrop (if backgroundColor is set).
    Applied to the backdrop SVG layer only — text remains at its own opacity.
```

Also add `"rect"` to the `shapeType` enum in `WTextGroup.style`:

```yaml
shapeType:
  type: string
  enum: [pill, rounded-rectangle, action-burst, rect]
  default: rounded-rectangle
```

Add `tailAnchorBlockId` to `WTextGroup`:

```yaml
tailAnchorBlockId:
  type: string
  nullable: true
  description: >
    If set, the tail anchor points toward this specific WTB within the group.
    The anchor coordinates are relative to this block's bounding box center.
    Falls back to the group center when null.
```

#### Step 1.2: `src/types/canvas.ts`

Add to `WTextBlockStyle`:

```ts
backgroundColor?: string;
backgroundOpacity?: number;
```

Update `WTextGroupStyle`:

```ts
shapeType?: "pill" | "rounded-rectangle" | "action-burst" | "rect";
```

Add to `WTextGroup`:

```ts
tailAnchorBlockId?: string | null;
```

#### Step 1.3: `src/constants/canvasDefaults.ts`

Add:

```ts
export const DEFAULT_WTB_BACKGROUND_OPACITY = 1;
```

`DEFAULT_WTB_BACKGROUND_COLOR` is intentionally omitted — falsy means "no backdrop."

Add `"rect"` to any shape-type discriminant union defaults as needed.

---

### Phase 2 — Path Utilities

#### Step 2.1: `src/utils/pathGenerators.ts`

Add `rectPath` generator:

```ts
export function rectPath(w: number, h: number): string {
  return `M 0 0 H ${w} V ${h} H 0 Z`;
}
```

Update `BackdropShapeType`:

```ts
export type BackdropShapeType = "pill" | "rounded-rectangle" | "action-burst" | "rect";
```

Update `getBackdropPath` to handle `"rect"`:

```ts
if (shapeType === "rect") return rectPath(width, height);
```

Also add a utility to measure individual block dimensions:

```ts
/** Computed dimensions of a single WTB's backdrop envelope.
 *  Currently just the block's intrinsic text width/height + padding.
 *  Later might account for the group's shapeType geometry adjustments. */
export interface BlockBackdropDimensions {
  width: number;
  height: number;
}
```

(This may evolve, but the block's own content size + padding is sufficient for now.)

---

### Phase 3 — Rendering (WTextGroup + WTextBlock)

#### Step 3.1: `src/components/canvas/WTextBlock/WTextBlock.tsx`

The component becomes self-contained for its backdrop. It receives additional props:

```ts
interface Props {
  panelId: string;
  groupId: string;
  block: WTextBlockType;
  groupShapeType: BackdropShapeType;
  groupBorderRadius: number;
  groupOpacity: number;
}
```

Logic:
- If `block.style.backgroundColor` is falsy → render text only (no SVG backdrop) — SFX mode.
- If `block.style.backgroundColor` is truthy:
  - Measure own content via a ref + ResizeObserver
  - Render an SVG backdrop path sized to content + padding using `getBackdropPath`, filled with `block.style.backgroundColor` and opacity `block.style.backgroundOpacity ?? DEFAULT_WTB_BACKGROUND_OPACITY`
  - The backdrop is rendered behind the text, in Layer 1 style
- Text renders at `block.style.opacity` (default 1) — Layer 2
- The `groupOpacity` is applied to the backdrop SVG only (not text), maintaining the alpha-preserving pipeline

#### Step 3.2: `src/components/canvas/WTextGroup/WTextGroup.tsx`

Simplify the rendering:

- Remove the unified SVG backdrop from WTextGroup (it was a single path covering all blocks).
- Instead, pass shape/opacity props down to each `WTextBlock`.
- The group container retains positioning (`left`, `top` based on group `x`, `y`).
- The group container dimensions are now computed as the bounding box of all child blocks (each of which may have its own size).
- Tail anchor rendering: if `tailAnchorBlockId` is set, compute the tail from the specified block's bounding box perimeter to the `tailAnchor` coordinates. Otherwise, compute from the group container perimeter (current behavior).

The separation of concerns:
- `WTextGroup` = positioning container + tail anchor logic + shape style provider
- `WTextBlock` = individual backdrop rendering + text rendering

#### Step 3.3: New or adjusted hook

Since each `WTextBlock` now manages its own backdrop, we may not need modifications to `useWPath` at the group level. However, `useWPath` is still useful for the group-level tail anchor computation (when no `tailAnchorBlockId` is set). Consider keeping it for that purpose.

A new lightweight hook `useWTBBackdrop` could encapsulate per-block dimension measurement → path generation, but inline logic in `WTextBlock.tsx` may suffice initially.

---

### Phase 4 — Documentation

#### Step 4.1: `README.md`

Update the **Alpha-Preserving Text Compositing** section to describe per-block backgrounds:

```
### 3. Alpha-Preserving Text Compositing
To support semi-transparent background colors on speech bubbles without accumulating
opacity when multiple bounding boxes intersect, the rendering pipeline splits into
two layers:

- **Layer 1 (Backgrounds Only)**: Renders SVG backdrop paths at the block level
  (when `WTextBlock.style.backgroundColor` is set) or at the group level (when blocks
  inherit the group backdrop). Background opacity is applied via
  `block.style.backgroundOpacity` or the parent `WTextGroup.style.opacity`.
- **Layer 2 (Foregrounds Only)**: Renders text characters at 100% solid opacity
  (subject to `block.style.opacity` for fade effects).

This split ensures that:
- Text remains perfectly legible regardless of backdrop transparency.
- Semi-transparent backdrops on adjacent blocks do not doubly stack opacity.
- SFX blocks (no backdrop, `backgroundColor` is falsy) render text directly
  on the panel artwork without any intervening layer.
```

Also add a note in the **Key Features** list about per-block backgrounds and SFX support.

#### Step 4.2: `misc/PLAN.md` (this file)

Complete when all phases are done — mark items as complete.

---

### Phase 5 — Future Considerations (not implemented now)

1. **Layer merging optimization**: When adjacent WTBs in the same group share identical `backgroundColor` + `backgroundOpacity`, merge their individual backdrops into a single SVG path to reduce DOM nodes and improve compositing performance.
2. **Per-block shape override**: Allow `WTextBlock.shapeType` to override the group's shape type for a single block.
3. **Tail anchor along block perimeter**: More granular tail attachment points per block (top, right, bottom, left edges, not just nearest point).
4. **Multi-color gradient backdrops**: Extend `backgroundColor` to accept gradient definitions.
