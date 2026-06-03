# Implementation Strategy: StatusBar & Inspector Overhaul

## Motivation

The current `StatusBar` only shows project name + panel count + generic selection label (no actionable info). The `Inspector` works but uses HTML-native form controls that lack the precision interactions required for a professional typesetting workstation. Both need to surface actual `WProject`/`WPanel`/`WTextGroup`/`WTextBlock` data and allow manipulation at the level described in README.md.

---

## Phase 1 — Custom UI Primitives (`src/components/shared/UI/`)

The current `InspectorFields.tsx` contains generic styled inputs but no specialized interaction handlers. A new set of opinionated controls lives in `src/components/shared/UI/`, each implementing README-grade precision.

All value outputs from these components **must be rounded to avoid floating-point bloat** — no raw floats escape the interaction handler.

### `SmartSlider`
- **Normal drag**: Adjust value by `step`.
- **Shift+drag**: Fine mode — step is divided by 10, then rounded. E.g. step 0.05 → fineStep 0.005 but rounded to 2 decimal places; step 1 → fineStep 0 (or keep at 1 since ints can't fine-step). For integer fields, shift may adjust by 1 while normal adjusts by 5 or 10.
- **Ctrl+drag**: Step mode — value snaps to the nearest entry in `ctrlSteps` array (e.g. opacity: `[0, 0.25, 0.5, 0.75, 1]`; font size: `[8, 12, 14, 16, 18, 20, 24, 32, 48, 64]`).
- **Props**: `value`, `onChange`, `onCommit`, `min`, `max`, `step`, `fineStep`, `ctrlSteps` (array of snap points), `label`.
- **Callbacks**: `onChange` fires on every tick (continuous commit); `onCommit` fires on mouse-up / blur (flushes history).

### `ScrubInput`
- A numeric display that acts as a scrubber when clicked-and-dragged horizontally (like Blender/After Effects/Ableton).
- **Normal drag**: adjust by `step`.
- **Shift+drag**: adjust by `fineStep` (rounded).
- **Ctrl+drag**: adjust by `step * 10` (coarse).
- Single-click the number to type an exact value directly.
- **Props**: `value`, `onChange`, `onCommit`, `min`, `max`, `step`, `fineStep`, `suffix` (e.g. "px", "%"), `label`.

### `SmartNumberInput`
- A number `<input>` augmented with:
  - **Up/Down arrows**: adjust by `step`.
  - **Shift+Up/Down**: adjust by `fineStep`.
  - **Ctrl+Up/Down**: snap to `ctrlSteps`.
- Wraps the native `<input type="number">` but overrides keydown to inject modifier logic before the native change fires.
- **Props**: subset of `ScrubInput` (omit the scrub behavior).

### `SegmentedControl`
- A button group for mutually exclusive options (shape type, text alignment, canvas theme).
- Each segment is a `<button role="radio" aria-checked>`. Active segment uses `bg-accent text-white`, inactive uses `bg-surface text-text-secondary`.
- **Props**: `options: {value, label, icon?}[]`, `value`, `onChange`.

### `ColorControl`
- A color swatch button that opens a native `<input type="color">` popover.
- Shows current hex value, optional preset swatch row beneath.
- **Props**: `value`, `onChange`, `onCommit`, `presets?`.

### `ToggleSwitch`
- Extracted from the existing `InspectorToggle` (currently in InspectorFields.tsx) into its own file with no functional changes, just for discoverability.
- **Props**: `checked`, `onChange`, `label?`, `disabled?`.

---

## Phase 2 — StatusBar Overhaul (`StatusBar.tsx`)

The StatusBar transforms from a passive label bar into an active information strip with interactive zones and room to grow. Height needs to be generous to accommodate future additions (animation pipeline entry, playback controls, render queue status, etc.).

### Layout (horizontal flex, `h-12` or taller)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ● Chapter 1  ·  12 panels  ·  31 blocks                           Panel 3  [640×480]  │  Undo (3)  │  <Z>  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Left Zone — Project Context
- **Project name** — double-click to edit inline. On dblclick, swap `<span>` for `<input>` that calls `updateProject((draft) => draft.name = val)` on blur/enter.
- **Canvas theme indicator** — small colored dot (`●` filled black/white with a subtle border).
- **Quick stats** — "12 panels · 31 blocks" (computed totals).
- **File dirty indicator** — `uiStore.revision` counter > 0 shows a subtle marker.

### Center Zone — Selection Breadcrumb
- Reads `selectedWPanelId / selectedWGroupId / selectedWBlockId` from `useUIStore`.
- Renders: `Panel 3 [640×480] › Group A › Block B` — deepest selected entity shows its key dimension.
- Clicking a segment calls the corresponding `selectPanel / selectTextGroup / selectTextBlock` on `useUIStore`.
- Falls back to `"No selection"` when nothing is selected.

### Right Zone — Future-Proof Dock
- **Undo stack count**: Shows `"Undo (3)"` if `past.length > 0`, otherwise dimmed. Shows `"Redo (1)"` if `future.length > 0`. No icons — text only. This is distinct from the floating undo/redo buttons in the viewport; the StatusBar gives a quick read of history depth.
- **Zoom indicator** (future): `<Z>` placeholder for when canvas zoom lands.
- **Animation Pipeline entry point** (future): a reserved slot for the Animation Editor toggle (icon/button). When the animation system lands, this is where the user opens the timeline.

### Future Expansion Notes
- The StatusBar height and right zone flex-grow area are deliberately generous to host:
  - **Animation Editor** toggle button + current frame / duration readout.
  - **Render queue** status (idle / rendering / complete).
  - **Export progress** bar for SVF generation.
- Once animation lands, the right zone may be split into a secondary toolbar row within the StatusBar, or the bar may expand to `h-16` with two rows.

---

## Phase 3 — Inspector Overhaul

### Part A — Swap existing fields for new UI primitives

Replace `<InspectorInput type="range">` and `<InspectorInput type="number">` in all four inspector components with `<SmartSlider>`, `<ScrubInput>`, and `<SmartNumberInput>` from Phase 1.

| Component | Current | Replace with |
|---|---|---|
| `TextGroupInspector` — Opacity | `<input type="range" step=0.05>` | `<SmartSlider step=0.05 fineStep=0.01 ctrlSteps=[0,0.25,0.5,0.75,1]>` |
| `TextGroupInspector` — X/Y | `<input type="number">` | `<ScrubInput suffix="px" step=1 fineStep=1>` |
| `TextGroupInspector` — Border radius | `<input type="number">` | `<ScrubInput suffix="px" step=1 fineStep=1>` |
| `TextGroupInspector` — Shape | `<select>` | `<SegmentedControl options={pill,rounded-rectangle,action-burst}>` |
| `TextGroupInspector` — Background | `<input type="color">` | `<ColorControl>` |
| `TextBlockInspector` — Font size | `<input type="number">` | `<ScrubInput suffix="px" step=1 fineStep=1 ctrlSteps=[8,12,14,16,18,20,24,32,48,64]>` |
| `TextBlockInspector` — Alignment | `<select>` | `<SegmentedControl options={left,center,right}>` |
| `TextBlockInspector` — Color | `<input type="color">` | `<ColorControl presets={#fff,#000,#ddd,…}>` |
| `TextBlockInspector` — Font weight | `<select>` | `<SmartNumberInput step=100 fineStep=50 ctrlSteps=[400,500,600,700,800]>` |
| `PanelInspector` — Width/Height | `<input type="number">` | `<ScrubInput suffix="px" step=1 fineStep=1>` |
| `ProjectInspector` — Grid size | `<input type="number">` | `<ScrubInput suffix="px" step=1 fineStep=1>` |
| `ProjectInspector` — Canvas theme | `<select>` | `<SegmentedControl options={light,dark}>` |

### Part B — Add missing data fields

Properties that exist in the type schemas but are not exposed in any inspector:

**PanelInspector additions:**
- **Image info**: show `imageUrl` (truncated) or "No image" badge; button to clear/remove image.
- **Gutter** (`panel.style.gutter`): `<ScrubInput suffix="px">`.
- **Border style** (`panel.style.borderStyle`): `<select>` or `<SegmentedControl>`.
- **Panel position** (`panel.x`, `panel.y`): show as read-only (currently `@planned` for absolute layout — data exists but flex layout ignores it). Add a note in the UI.
- **Lock aspect ratio toggle**: when editing width/height, optionally maintain ratio. A simple link icon button between the two fields.

**TextGroupInspector additions:**
- **Tail anchor coordinates**: currently only a `hasTail` checkbox that hardcodes `x: g.x, y: g.y + 80`. Show actual `tailAnchor.x/y` as editable `<ScrubInput>` pair when tail is enabled.
- **Border width** (`group.style.borderWidth`): `<ScrubInput suffix="px">`.
- **Group opacity** (`group.style.opacity`): already present, but use SmartSlider.
- **Block list summary**: compact numbered list of contained blocks (content preview truncated to 30 chars) with click-to-select.

**TextBlockInspector additions:**
- **Background color** (`block.style.backgroundColor`): `<ColorControl>` — currently missing entirely from the inspector.
- **Background opacity** (`block.style.backgroundOpacity`): `<SmartSlider step=0.05>`.
- **Block opacity** (`block.style.opacity`): `<SmartSlider step=0.05>` — exists in type, missing from inspector.
- **Line height** (`block.style.lineHeight`): `<ScrubInput step=0.1 suffix="×" fineStep=0.05>`.
- **Font family** (`block.style.fontFamily`): `<select>` with system fonts.

**ProjectInspector enhancements:**
- **Panel defaults**: quick controls for default panel width/height for new panels (read from constants, editable).
- **Total stats card**: "12 panels · 31 text blocks · last edited 2 min ago" summary.

### Part C — Restructure Inspector layout

Current: a flat `<div className="flex flex-col gap-6">` per inspector.

New:
- **Collapsible sections**: `InspectorSection` gets a `defaultOpen` prop and a collapse chevron. Stored in local state (per-instance, not persisted).
- **Multi-column layout for sparse fields**: X/Y side by side, Width/Height side by side — use `grid grid-cols-2 gap-2`.
- **Action section** separated at bottom with a subtle divider.

### Part D — Replace Project tab bar with sub-navigation

Current: two tabs ("Project Controls" / "Global Styling") rendered in `Inspector.tsx`. The "Global Styling" tab shows a placeholder.

New:
- Three tabs rendered as `<SegmentedControl>`: **Canvas** (existing controls), **Defaults** (default panel dimensions, new panel template), **Info** (metadata, stats, created/updated timestamps).

---

## Phase 4 — uiStore additions

```typescript
// additions to UIState
revision: number;                // increment with each updateProject call, reset on setProject
incrementRevision: () => void;
```

The `revision` field serves as a dirty indicator for the StatusBar. On `setProject`, reset to 0. On every `updateProject`, increment by 1. Never persisted — purely ephemeral.

---

## Phase 5 — projectStore additions

```typescript
// additions to ProjectState
getTotalTextBlockCount: () => number;  // computed across all panels
```

This is a convenience accessor — computed from existing state to drive StatusBar quick-stats without inline reduce calls.

---

## Suggested README.md additions

The following sections should be added to `README.md` to document the new interaction model:

### StatusBar Reference
After the current "Tech Stack" section (or under a new "Interface" heading), add:

> **StatusBar** — The bar at the bottom of the editor shows project context (name, panel/block counts, dirty indicator), a selection breadcrumb for the current canvas entity hierarchy, and a dock for future tools (animation editor, zoom, render queue). Double-click the project name to rename. Click a breadcrumb segment to jump the selection to that entity. The undo stack depth is shown in text form (e.g. `Undo (3)`).

### Smart Interaction Modifiers
Add to the beginning of the "Inspector" section or as a note under "Layout & State Mechanics":

> **Precision Modifiers** — Throughout the editor's numeric controls (sliders, scrub inputs, spinners):
> - **Drag / Arrow keys**: adjust by the default step.
> - **Shift+drag / Shift+arrow**: fine-tuning — step divided by 10 (never sub-pixel; all values are rounded).
> - **Ctrl+drag / Ctrl+arrow**: stepped mode — value snaps to predefined increments (e.g. whole 25% opacity stops, common font sizes).
> - **Scrub inputs** (click-and-drag a numeric label): provide rapid horizontal scrubbing. Click the number to type an exact value.

### Animation Editor Docking (Future)
Add a placeholder note under "Key Features" or a new "Planned" subsection:

> **Animation Editor** [Planned] — A timeline-based panel for configuring WTextBlock transitions (fade, slide, scale) and panel sequencing. Accessed via an icon in the StatusBar. Will integrate with Remotion export pipeline.

---

## Implementation Order

1. **Phase 1** — Build all UI primitives in `src/components/shared/UI/`. Each component is a single file. No store changes needed. Verify each in the browser via a temporary test route.
2. **Phase 4 + 5** — `uiStore.revision` and `projectStore.getTotalTextBlockCount`.
3. **Phase 2** — Rewrite `StatusBar.tsx`. Uses new store fields and `ScrubInput` for inline rename.
4. **Phase 3A** — One by one, swap form controls in existing inspectors. Each swap is a small, safe edit.
5. **Phase 3B** — Add missing fields. Each new field is a small edit to the relevant `*Inspector.tsx`.
6. **Phase 3C + 3D** — Layout restructuring and tab bar redesign.
7. **README.md** — Update the docs with the new interaction conventions.
