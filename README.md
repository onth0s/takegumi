# 🎋 Takegumi — 竹組み

Takegumi is a high-fidelity, web-based content creation and typesetting workstation designed specifically for composing webtoon panels, adding highly styled text overlays, and configuring dynamic transitions. It allows users to compose narrative text, dialogue, and action effects over vertical image strips, style them with advanced typography, animate them, and visually preview the results. As well as Short Video Format (SVF) export capabilities.

The name **Takegumi** (竹組み) refers to the Japanese art of bamboo-framing or assembly, reflecting the tool's focus on structuring panel layouts, borders, and typography into a cohesive sequence.

---

## 🚀 Key Features

*   **Continuous Vertical Canvas**: Simulates a mobile-native webtoon reading flow with intuitive `@dnd-kit`-powered drag-and-drop panel reordering, image file drops, and interactive click-to-upload workflows.

* **Macro Sequence Grid Overview**: A responsive thumbnail dashboard mapping the structural narrative at a glance.

* **Immersive Playback Player**: A full-featured test player.

* **Synthetic Border Carving System**: A dynamic border engine that computes panel borders and cleanly carves out gaps wherever text "bubbles" overlap them, ensuring a clean, modern graphic novel aesthetic.

* **Alpha-Preserved Text Compositing**: A two-layer rendering pipeline that isolates semi-transparent text bubble backgrounds within groups to prevent ugly overlapping alpha build-up.

* **Markdown Script Parser**: Automates project setup by converting plain text scripts with markdown panel demarcations (`[[1]]`, `[[2]]`) and speaker lines (`_Speaker_: dialogue`) into fully populated layouts.

---

## 🛠 Tech Stack

* **Core Framework**: Next.js 16 + App Router.

* **Rendering Library**: React 19.

* **State Management**: Zustand 5 equipped with `immer` for immutable state mutation and `persist` for LocalStorage synchronization.

* **Styling Engine**: Tailwind CSS v4 configured with CSS variables and design tokens in [globals.css].

* **Drag-and-Drop Operations**: `@dnd-kit` (Core, Sortable, and Utilities).

* **Micro-interactions & Fluid UI**: `motion` utilized via `motion/react` for high-performance, hardware-accelerated layout and gesture transitions.

* **Storage Medium**: IndexedDB with `localForage`

* **Virtualization Engine**: `@tanstack/react-virtual` for dynamic, variable-height windowing while maintain 60fps scrolling across infinite vertical layouts.

* **Video Rendering Engine**: `remotion` & `@remotion/player` to programmatically orchestrate video rendering for Short Video Format (SVF) exports directly in the client browser.

---

## 🏗 System Architecture & Mechanics

### 1. Dual-Store State Separation
To maintain blazing-fast rendering speeds and keep saved projects lightweight, Takegumi splits its state into two distinct stores:

* **[useProjectStore]** (Persistent): Manages domain entities like WProjects, WPanels, WTextGroups, and WTextBlocks. It saves data to `localStorage` and handles data schema migrations (e.g. migrating flat text blocks into composite `WTextGroup` models).

* **[useUIStore]** (Ephemeral): Tracks transient runtime parameters such as selection highlights (`selectedWPanelId`, `selectedWTextBlockId`), right-click context menu positions, and active sidebar inspector tabs.

### 2. SSR-Safe Hydration Guard
To prevent mismatch warnings when Next.js compares server-rendered layouts with persisted client storage, the system employs the custom [useHydration] hook. The editor interface delays rendering persistent state elements until hydration has successfully resolved in the client browser.

### 3. Dynamic SVG Synthetic Borders (`useWBorder`)
Standard CSS outlines and borders are structurally rigid, drawing lines straight through overlying speech bubbles. Takegumi solves this by projecting overlapping text boundaries onto the panel's borders and calculating a single, mathematically precise SVG border frame:

1. **Boundary Intersections**: The system monitors panel dimensions and overlay text container (`WTextGroup`) coordinates using a debounced `ResizeObserver`.

2. **Interval Merging**: For each of the four panel edges (Top, Right, Bottom, Left), the engine projects the intersecting segments of the overlapping bubbles. It runs a **merge-intervals algorithm** to combine overlapping bounds into distinct "gap" intervals.

3. **SVG Path Generation**: Instead of spawning multiple absolute DOM nodes, the `useWBorder` hook translates the remaining solid border segments into a single, optimized SVG path string (using `M` for move-to and `L` for line-to commands).

4. **Hardware-Accelerated Rendering**: The calculated path is fed into a single `<svg>` element wrapping the panel. This eliminates layout thrashing during active drag-and-drop or resize operations, resulting in a perfectly clean, gap-carved graphic novel aesthetic.

### 4. Alpha-Preserving Text Compositing
To support semi-transparent background colors on speech bubbles without accumulating opacity when multiple bounding boxes intersect, [WTextGroup.tsx] splits rendering into two layers:

*   **Layer 1 (Backgrounds Only)**: Renders only the background boxes under a parent-level group opacity style.

*   **Layer 2 (Foregrounds Only)**: Renders only text characters, borders, and shadows at 100% solid opacity.
This structure ensures text remains perfectly legible and shadows do not look double-rendered or muddy.

---

## 🗃 Data Models & Schemas

Takegumi operates on a normalized state structure:

* **WProject**: The root document representing a single chapter or webtoon draft.

* **WPanel**: An individual graphic framework holding a background image as well as optional WTextGroups.

* **WTextGroup**: An opacity-unified envelope linking multiple WTextBlocks.

* **WTextBlock**: An individual block containing text content, styling configurations, and transition parameters.

Further Schema Specifications are to be found as YAML files in /gnd (ground directory, as the single source of truth).

---

## ⏳ State-Level History System (Undo / Redo Archetype)

1. Architecture Overview
To provide a robust, lightweight history without bloating memory or performance hiccups, Takegumi utilizes a Linear State-Snapshot Command Stream on top of the persistent state store.

Instead of tracking micro-mutations on an element-by-element basis, the history engine leverages Zustand's immutable structural sharing via immer. This guarantees that unaffected nodes share references between history frames, keeping the memory footprint exceptionally low.

```text
[User Action] ───> Throttled / Debounced Trigger
                                 │
                                 ▼
┌───────────────────────────────────────────────────────────┐
│                 History Middleware Layer                  │
│                                                           │
│  ┌──────────────┐     ┌────────────────────┐              │
│  │  Past Stack  │ <── │ Current App State  │              │
│  └──────────────┘     │ (useProjectStore)  │              │
│                       └────────────────────┘              │
│                                  │                        │
│                                  ▼                        │
│                       ┌──────────────┐                    │
│                       │ Future Stack │                    │
│                       └──────────────┘                    │
└───────────────────────────────────────────────────────────┘
```

2. Core Mechanics & State Boundary
The history ecosystem explicitly separates Domain State from Ephemeral UI State:

Included in History (useProjectStore): Structural modifications to WProjects, WPanels, WTextGroups, and WTextBlocks.

Excluded from History (useUIStore): Selection states, side panel toggle states, hovering highlights, and context menu coordinates. This ensures that hitting "Undo" resets the actual canvas layout rather than merely toggling an inspector sidebar tab.

3. Commit Strategies & Interaction Filtering
To prevent every single pixel of a drag interaction from pushing a new state onto the history stack, the engine utilizes three distinct commit behaviors:

* Discrete Commits (Immediate): Actions such as deleting a panel, adding a new text bubble, or importing a Markdown script trigger an instantaneous snapshot push.

* Continuous Commits (Debounced / On-Release): Fluid interactions —such as dragging elements or typing text— do not write to the history stack mid-action. Instead, the temporary state updates live in the store, and a history frame is only committed upon interaction termination (e.g., onDragEnd from @dnd-kit or a 500ms debounce on text entry).

* Stack Merging: Consecutive structural property shifts of the exact same element within a tight window are squashed together into a single history frame to avoid timeline fragmentation.

4. Maximum Depth & Eviction Policy
To shield the environment from memory exhaustion, the past and future stacks enforce a configurable ceiling constraint (Default: 50 operations). Once this threshold is crossed, the oldest history state undergoes a FIFO (First-In, First-Out) eviction, releasing its references for garbage collection.

---

## 🧲 Global Grid Snapping System

1. Architecture Overview
The Global Grid Snapping System is a math-driven layout helper operating entirely inside the ephemeral client canvas. Its job is to calculate spatial relationships during movement or resizing transformations, aligning canvas entities (WPanels and WTextGroups) to either a global structural matrix or relative sibling boundaries.

2. The Twin Alignment CoreThe engine evaluates layout tracking along two independent channels:

- A. Absolute Grid Projection
Maintains a configurable, non-rendering layout grid framework (fixed N px increments). 

As an element translates across the viewport, its bounding box coordinates are evaluated using a proximity threshold algorithm:

`Snapped Coordinate = Round (Current Coordinate / Grid Size) * Grid Size.`

- B. Relative Sibling Proximity (Smart Guides)

During active element movement, a specialized spatial query checks the bounding rects of all other active nodes present within the same container context.

It evaluates equality thresholds across 6 distinct alignment vectors: Left, Right, Top, Bottom, Vertical Center, and Horizontal Center.

3. Pipeline Executions (Transform Phase)

The transformation cycle runs on a strict pipeline during runtime movement updates:

[Raw Pointer Movement] 
         |
         v
[Extract Box Bounding Rect] 
         |
         v
[Execute Proximity Math Filters] ---> Threshold Check (< N px) -> Target Found?
                                              |                        |
                                              | (Yes)                  | (Yes)
                                              v                        v
                                   [Apply Snapped Coordinates]  [Inject Guide Paths into useUIStore]

- 1. Capture Phase: @dnd-kit or gesture listeners stream raw target coordinate mutations.

- 2. Proximity Math Filter: The system cross-references the raw value against grid coordinates and adjacent sibling edges. If a coordinate falls within the Proximity Snap Threshold (Default: 4px), the raw position is overridden by the snapped coordinate.

- 3. State Broadcast: The overridden coordinates are committed directly to the viewport representation layout.

- 4. Visual Guide Injection: If a relative alignment snap successfully triggers, the snapping engine generates temporary line configuration vectors (e.g., [{ direction: 'vertical', x: 240 }]) and injects them directly into useUIStore.

4. Performance Mitigation (Spatial Hashing)

Calculating snapping vectors against dozens of text nodes and layout strips simultaneously on every frame can degrade performance. To avoid O(N^2) computational complexity spikes, Takegumi leverages Spatial Hashing.

The canvas landscape is subdivided into a broad matrix grid. The snapping engine completely ignores elements residing in distant quadrants, calculating alignment paths exclusively against elements sharing the local or immediate adjacent bounding buckets. This maintains solid 60fps visual fidelity on hardware-accelerated layouts.

---

## Unified SVG Backdrop & Dynamic Tail Anchoring Engine (useWPath)

To bypass the structural limitations of rigid HTML layouts, Takegumi utilizes a unified SVG rendering engine within WTextGroup.tsx. Rather than applying standard CSS backgrounds, borders, and complex clip-paths across disjointed DOM elements, the system computes a singular dynamic SVG path that handles text backdrops, responsive speech bubble tails, and panel border intersections simultaneously.

* A. Mechanics of the SVG Pipeline

- 1. Dimension Sensing: The layout uses a hidden, accessible HTML text layer to handle native browser typesetting, wrapping, and typography tokens. A debounced ResizeObserver measures the collective bounding box of these text clusters.

- 2. Vector Synthesis: The useWPath hook receives these dimensions, injects user-defined padding variables, and generates a base vector path representing the speech bubble wrapper (e.g., pill, rounded rectangle, or jagged action-burst shapes).

- 3. Dynamic Tail Generation: Each WTextGroup schema includes an optional tailAnchor: { x: number, y: number } coordinate relative to its parent WPanel. The engine calculates the closest perimeter point on the bubble vector and projects a secondary path sequence (the "tail") that stretches to the anchor target without distorting the main bubble geometry.

* B. Native Clipping & Synthetic Border Simplification

By lifting both the panel borders and the dialogue bubbles into vector space, Takegumi eliminates layout thrashing caused by calculating absolute DOM segment offsets (WBorderStrips.tsx). 

- Vector Masking: The computed text bubble paths are fed directly into an SVG <clipPath> mask applied to the parent panel's framework.

- Flawless Intersections: The border engine automatically subtracts the intersecting geometry of the text bubble path from the border path, programmatically generating clean visual gaps where text overlaps panel boundaries. This ensures absolute computational accuracy during high-performance layout manipulation or continuous canvas scrolling.

---

## 📖 Script Parsing Format

To speed up layout creation, you can write or import a standard text script in Markdown. Takegumi reads it via `src/utils/parseScript.ts` and sets up panels automatically.

Example format:
```markdown
# Chapter title

[[1]]
This is an automatically created narrative text block in Panel 1.

_Speaker Name_: This is dialogue for the first panel!

[[2]]
_Another Speaker_: Dialogue on Panel 2.
```

*   `[[N]]` structures panel divisions.
*   `_Character_:` configures dialogue speech boxes.
*   Lines without character marks automatically format as narrative blocks.
