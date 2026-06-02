# Takegumi Architecture Implementation Plan

This implementation plan outlines the sequential phases to establish Takegumi's core business logic, visual calculation engines, and editors.

---

## Phase 1: State Management & History Core
Establish the foundation of the editor's state and transaction layers.

### 1. Unified Schema Definitions (`/gnd`)
* Create schema validation rules (e.g. YAML or JSON schema files) defining `WProject`, `WPanel`, `WTextGroup`, and `WTextBlock`.

### 2. Dual-Store Architecture
* **`useProjectStore`**: Handles domain models (`WProject`, `WPanel`, etc.). Uses `localForage` (IndexedDB) for persistent client storage.
* **`useUIStore`**: Handles transient layout, active selections, guide vectors, and context menu coordinates.
* **`useHydration` Hook**: Prevents SSR mismatch errors by guarding rendering until IndexedDB is fully loaded on the client side.

### 3. History System (Undo/Redo Layer)
* Create `immer`-powered history middleware for `useProjectStore`.
* Implement **Commit Strategies**:
  * **Discrete**: Snapshots committed immediately on structural adjustments (creation, deletion, script imports).
  * **Continuous**: Debounced snapshots on active dragging or character typing (updates commit upon release).
  * **Stack Merging**: Squash fast-successive changes to the same element ID.

---

## Phase 2: Dimension Sensing & SVG Backdrop Engine (`useWPath`)
Implement the text rendering and speech bubble engine.

### 1. Offscreen Dimension Sensing
* Create a headless layout calculator using `OffscreenCanvas` and `ctx.measureText()`.
* Measure exact text boundaries, line wraps, and dimensions based on active styles without writing to the DOM.

### 2. Backdrop Vector Synthesis
* Build vector generators to output standard speech shapes (pill, rounded rectangle, action-burst).
* Map structural boundaries into custom SVG paths.

### 3. Dynamic Tail Anchoring
* Map the `tailAnchor` relative coordinates.
* Calculate perimeter intersection coordinates and draw a secondary path sequence ("tail") extending to the target anchor.

### 4. Alpha-Preserving Text Compositing
* Update `WTextGroup.tsx` to separate rendering into two layers:
  * **Background layer**: Only SVG background shapes at target opacity.
  * **Foreground layer**: Raw text and shadows at 100% solid opacity.

---

## Phase 3: Synthetic Panel Borders (`useWBorder`)
Build the edge carving engine that cuts gaps in panel borders where speech bubbles overlap.

### 1. Intersection Mapping
* Retrieve panel borders and overlay bounding boxes.
* Project intersecting speech bubbles onto the four panel edges (Top, Right, Bottom, Left).

### 2. Interval Merging
* Apply the **merge-intervals algorithm** to identify consolidated overlap zones (gaps) for each edge.

### 3. Path Generation
* Synthesize remaining solid edge segments into a single SVG path string with explicit `M` and `L` commands.
* Integrate with `WPanel` rendering.

---

## Phase 4: Drag-and-Drop & Snapping Engine
Integrate fluid layouts and canvas placement alignment.

### 1. Continuous Canvas Reordering
* Set up `@dnd-kit` inside the vertical page layout wrapper to support panel reordering and image dropping.

### 2. Snapping & Guides
* **Grid Projection**: Proximity snapping to fixed increments.
* **Relative Sibling Proximity (Smart Guides)**: Align boundaries against sibling elements. Generate temporary line vectors to render in `useUIStore`.
* **Spatial Hashing**: Subdivide canvas coordinates to prevent excessive coordinate calculations.

---

## Phase 5: Markdown Script Parser
Automate workspace populating.

### 1. Parser Engine (`src/utils/parseScript.ts`)
* Process chapters with `[[N]]` boundaries to create `WPanel` items.
* Group script text labeled `_Speaker_: dialogue` into `WTextGroup` layouts.
* Add generic text blocks for narrative annotations.

---

## Phase 6: Playback, Export & Remotion Player
Enable preview and output.

### 1. Playback Engine
* Mount `@remotion/player` to inspect sequencing.
* Create frames mapping transitions and styled movement.
* Establish export configurations to compile high-fidelity SVF outputs.
