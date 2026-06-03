# Grid Snapping System — Implementation Plan

## Overview

Implement the "Global Grid Snapping & Smart Guides" system described in README.md section 2. This covers a snapping math engine, a visual SVG grid overlay (`WGrid`), a draggable debug axis for manual verification, and the Inspector/project-model plumbing to control it all.

---

## Phase 1 — Data Model & Constants

### 1.1 New type: `WProjectGrid`

**File:** `src/types/canvas.ts`

```ts
export type CanvasTheme = "light" | "dark";

export interface WProjectGrid {
  /** Grid cell size in pixels (default: 10). */
  size: number;
  /** Master toggle for snap-to-grid (default: true). */
  snapEnabled: boolean;
  /** Show/hide the grid overlay (default: true). */
  showGrid: boolean;
}
```

### 1.2 New field on `WProject`

Add two properties to `WProject`:

```ts
export interface WProject {
  // … existing fields …
  grid: WProjectGrid;
  /** "light" → WProject bg is white, Viewport/WGrid are dark.
   *  "dark"  → WProject bg is black, Viewport/WGrid are light. */
  canvasTheme: CanvasTheme;
}
```

### 1.3 Schema & defaults

| File | Change |
|---|---|
| `src/constants/canvasDefaults.ts` | Add `DEFAULT_GRID_SIZE = 10`, `DEFAULT_GRID_SNAP_ENABLED = true`, `DEFAULT_GRID_SHOW_GRID = true`, `SNAP_PROXIMITY_THRESHOLD = 4`, `DEFAULT_CANVAS_THEME = "light"` |
| `src/utils/createProject.ts` | Seed `grid: { size: 10, snapEnabled: true, showGrid: true }` and `canvasTheme: "light"` in `createBlankProject()` |
| `gnd/schemas/canvas.yaml` | Mirror `grid` + `canvasTheme` on `WProject` |

### 1.4 Threshold sanitisation

`SNAP_PROXIMITY_THRESHOLD` is a constant (4px). At runtime the effective threshold is clamped:

```
effectiveThreshold = Math.min(SNAP_PROXIMITY_THRESHOLD, gridSize / 2)
```

This guarantees a coordinate can never be within range of two adjacent grid lines simultaneously (which would cause oscillation/ambiguity). When `gridSize ≤ 8`, the effective threshold shrinks proportionally.

---

## Phase 2 — Pure Snap Math

**File:** `src/utils/snapMath.ts` (zero dependencies, pure functions)

| Export | Signature | Behaviour |
|---|---|---|
| `snapValue` | `(value: number, gridSize: number) => number` | Rounds `value` to nearest `gridSize` increment: `Math.round(value / gridSize) * gridSize` |
| `snapRect` | `(rect: Rect, gridSize: number) => Rect` | Snaps `x, y, width, height` independently |
| `isWithinThreshold` | `(a: number, b: number, threshold: number) => boolean` | `Math.abs(a - b) <= threshold` |
| `getClosestGridLine` | `(value: number, gridSize: number) => { line: number; delta: number }` | Returns the nearest grid line and the signed distance from `value` |

---

## Phase 3 — `useSnapping` Hook

**File:** `src/hooks/useSnapping.ts`

Reads `project.grid` from `useProjectStore`, computes `effectiveThreshold`, and exposes:

```ts
interface UseSnappingResult {
  snapValue: (v: number) => number;
  snapRect: (rect: Rect) => Rect;
  gridSize: number;
  snapEnabled: boolean;
  effectiveThreshold: number;
}
```

If `!snapEnabled`, `snapValue` / `snapRect` return the input unchanged (passthrough).

---

## Phase 4 — `WGrid` Component

**File:** `src/components/canvas/WGrid/WGrid.tsx`

### Purpose
An SVG overlay that draws vertical/horizontal grid lines across the full Viewport area. Uses an SVG `<pattern>` for zero-DOM-overhead tiling — a single `<rect>` fills the viewport.

### Props

```ts
interface WGridProps {
  gridSize: number;
  canvasTheme: CanvasTheme;
}
```

### Grid line colour logic

Derived from `canvasTheme`:

| Token | Light theme | Dark theme |
|---|---|---|
| Viewport / WGrid background | Dark (current `bg-grid`) | Light/inverted |
| Minor line | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.15)` |
| Major line (every 4th) | `rgba(0,0,0,0.22)` | `rgba(255,255,255,0.28)` |

### Major line subdivision

Every 4th line (indices 0, 4, 8, 12…) is drawn with slightly higher opacity and thickness. 4 divides evenly from any grid size: major grid interval = `gridSize × 4`.

### Implementation

- Wraps the Viewport's inner container as a positioned parent
- `<svg>` with `pointer-events: none`, `position: absolute`, `inset: 0`
- Uses `<defs><pattern id="grid" …>` for the repeating unit
- One `<rect>` fills the viewport with the pattern
- A `ResizeObserver` updates the SVG viewBox when viewport dimensions change
- The pattern draws two types of lines in one pattern cell:
  - Minor: the basic `gridSize × gridSize` cell lines
  - Major: every 4th cell boundary — overlaid via a second check in the pattern or a separate `<rect>` with a `4×`-sized pattern

---

## Phase 5 — `DebugAxis` Component

**File:** `src/components/debug/DebugAxis.tsx`

### Purpose
A draggable crosshair used to manually verify snapping works. **Only rendered in development** (`process.env.NODE_ENV === 'development'`).

### Behaviour
- Rendered as a thin horizontal + vertical line crossing at a draggable intersection point
- Dragged via native pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`)
- Coordinates flow through `useSnapping` during drag — snapped in real time
- Visual indicator: green dot when snapped to grid, grey dot when free
- Small floating label near the intersection showing `(x, y)` coordinates
- **Not persisted** — ephemeral `useState` for position, starts at center of viewport

### Why this exists
Panels are flexbox-positioned (not absolute) and WTextGroups are positioned but not yet draggable. This gives us an immediate test harness to validate the snap engine before wiring it to production drag interactions.

---

## Phase 6 — ProjectInspector Additions

**File:** `src/components/layout/Editor/inspector/ProjectInspector.tsx`

Add a "Grid" section after the existing "Project" section:

| Control | Binds to | Type |
|---|---|---|
| Show Grid | `project.grid.showGrid` | Checkbox/toggle |
| Snap to Grid | `project.grid.snapEnabled` | Checkbox/toggle |
| Grid Size | `project.grid.size` | Number input, min=2, max=100, step=1 |
| Canvas Theme | `project.canvasTheme` | Toggle or select: Light / Dark |

Uses the same `updateProject("continuous")` + `endContinuousCommit()` pattern as the existing `handleNameChange`.

---

## Phase 7 — Viewport Integration

**File:** `src/components/layout/Editor/Viewport.tsx`

Structural changes:

```tsx
<div className="flex-1 h-full overflow-hidden" style={{ background: viewportBg }}>
  <div className="relative w-full h-full">
    {project.grid.showGrid && (
      <WGrid gridSize={project.grid.size} canvasTheme={project.canvasTheme} />
    )}
    <div className="flex items-center justify-center w-full h-full">
      <WProject project={project} />
    </div>
    {process.env.NODE_ENV === 'development' && (
      <DebugAxis gridSize={project.grid.size} snapEnabled={project.grid.snapEnabled} />
    )}
  </div>
</div>
```

- Replace the hard-coded `bg-grid` class with a dynamic background that flips based on `canvasTheme`
- WGrid is rendered only when `project.grid.showGrid` is `true` (default: `true`)
- WProject's own `bg-white` class is replaced by a dynamic `canvasTheme`-driven class

---

## Phase 8 — WProject Dynamic Background

**File:** `src/components/canvas/WProject/WProject.tsx`

Replace `bg-white` with a class driven by `canvasTheme`:

| `canvasTheme` | WProject bg | Viewport bg | WGrid line color |
|---|---|---|---|
| `"light"` | `bg-white` | Dark (`bg-grid` or equivalent) | Dark |
| `"dark"` | `bg-black` | Light (inverted dot pattern) | Light |

The `bg-grid` utility in `globals.css` currently hard-codes white dots. It will be adapted or complemented with a `bg-grid-inverse` utility, or the dot colour can be driven via a CSS variable set by `canvasTheme`.

---

## 9. Implementation Order

| Step | Files | What |
|---|---|---|
| 1 | `canvas.ts`, `canvasDefaults.ts`, `createProject.ts`, `canvas.yaml` | Model: add `WProjectGrid`, `canvasTheme`, defaults |
| 2 | `src/utils/snapMath.ts` | Pure snap functions + threshold clamp |
| 3 | `src/hooks/useSnapping.ts` | Hook wrapping snapMath with project config |
| 4 | `src/components/canvas/WGrid/WGrid.tsx`, `WGrid/index.ts` | SVG pattern-based grid overlay |
| 5 | `src/components/debug/DebugAxis.tsx` | Draggable test axis (dev-only) |
| 6 | `ProjectInspector.tsx` | Grid section with toggles + theme selector |
| 7 | `WProject.tsx` | Dynamic bg based on `canvasTheme` |
| 8 | `Viewport.tsx` | Wire WGrid, DebugAxis, dynamic Viewport bg |
| 9 | `globals.css` | Add inverse grid utility if needed |
| 10 | `src/components/canvas/index.ts` | Export WGrid from barrel |
| 11 | Verify | Open project → grid ON by default; drag axis snaps to 10px increments; toggle show/snap/theme works |

---

## 10. Verification Checklist

- [ ] Fresh blank project: grid overlay visible by default (10px cells)
- [ ] Debug axis appears in dev mode, draggable, snaps to grid when enabled
- [ ] Green/red indicator on debug axis confirms snapped / free state
- [ ] "Show Grid" off → overlay hidden; on → visible
- [ ] "Snap to Grid" off → axis moves freely; on → snaps
- [ ] Grid Size change → lines redraw, snap aligns to new size
- [ ] Canvas Theme "light" → WProject white, Viewport dark, grid lines dark
- [ ] Canvas Theme "dark" → WProject black, Viewport light, grid lines light
- [ ] Grid Size ≤ 8: effective threshold shrinks; no ambiguous double-snap
