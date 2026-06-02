# 🎋 **Takegumi** — 竹組み

- Takegumi is a high-fidelity, web-based content creation and typesetting workstation designed specifically for composing webtoon panels, adding highly styled text overlays, configuring dynamic transitions, and exporting to Short Video Format (SVF).
The name **Takegumi** (竹組み) refers to the Japanese art of bamboo-framing or assembly, reflecting the tool's focus on structuring panel layouts, borders, and typography into a cohesive sequence.
---
## ✨ Key Features
* **Continuous Vertical Canvas**: Simulates a mobile-native webtoon reading flow with intuitive `@dnd-kit`-powered drag-and-drop panel reordering, image file drops, and interactive click-to-upload workflows.
* **Macro Sequence Grid Overview**: A responsive thumbnail dashboard mapping the structural narrative at a glance.
* **Immersive Playback Player**: A full-featured test player built for instant review.
* **Synthetic Border Carving**: A dynamic border engine that computes panel borders and cleanly carves out gaps wherever text bubbles overlap them, ensuring a clean, modern graphic novel aesthetic.
* **Alpha-Preserved Text Compositing**: A two-layer rendering pipeline that isolates semi-transparent text bubble backgrounds to prevent visual opacity build-up.
* **Markdown Script Parser**: Automates project setup by converting plain text scripts with panel demarcations (`[[1]]`, `[[2]]`) and speaker lines (`_Speaker_: dialogue`) into fully populated layouts.
---
## 🎨 The Visual & Rendering Engine
### 1. Dynamic SVG Synthetic Borders (`useWBorder`)
Standard CSS outlines and borders are structurally rigid, drawing lines straight through overlying speech bubbles. Takegumi solves this by projecting overlapping text boundaries onto the panel's borders and calculating a single, mathematically precise SVG border frame.
To keep Takegumi operating at a flawless 60fps during intense canvas transformations, the geometric math of the synthetic border engine runs on a highly optimized, synchronous main-thread pipeline. Whenever a user manipulates a panel or text group, runtime event streams from tools like `@dnd-kit` capture raw position updates and immediately pass the coordinates of the active panel bounding boxes and overlapping text nodes to the engine.
Instead of introducing asynchronous thread-boundary latency with Web Workers (which would cause the carved border gaps to visibly lag behind during active dragging), the system performs calculations synchronously. Because we eliminate DOM-induced layout thrashing via a headless canvas rendering pipeline, the core operations run in under 0.2ms:
* **Interval Merging**: For each of the four panel edges (Top, Right, Bottom, Left), the engine projects the intersecting segments of the overlapping speech bubbles. It runs a **merge-intervals algorithm** to combine overlapping bounds into distinct "gap" intervals.
* **SVG Path Generation**: The remaining solid vectors are translated into a single, optimized SVG path string built from explicit `M` (move-to) and `L` (line-to) commands.
* **Synchronous Broadcast**: The fully computed, clean SVG path string is committed directly to `useUIStore` synchronously just in time for hardware-accelerated GPU painting, guaranteeing that the border gap perfectly tracks the bubble's position without any visual lag.
### 2. Unified SVG Backdrop & Dynamic Tail Anchoring Engine (`useWPath`)
To bypass the structural limitations of rigid HTML layouts, Takegumi utilizes a unified SVG rendering engine within [WTextGroup.tsx]. Rather than applying standard CSS backgrounds, borders, and complex clip-paths across disjointed DOM elements, the system computes a singular dynamic SVG path that handles text backdrops, responsive speech bubble tails, and panel border intersections simultaneously.
#### A. Mechanics of the SVG Pipeline
* **Dimension Sensing**: The layout transitions from a DOM-bound `ResizeObserver` approach to an offscreen headless rendering pipeline. Takegumi initializes an isolated, offscreen HTML5 Canvas context (`OffscreenCanvas`) pre-configured with the precise font metrics, line-height vectors, and CSS design tokens specified by the active theme. As a user types a script or modifies a dialogue bubble, a dedicated utility uses `ctx.measureText()` inside a pure JavaScript loop to instantly map word boundaries, calculate structural wrapping thresholds, and output explicit bounding dimensions for the `WTextGroup` envelope without touching the actual DOM.
* **Vector Synthesis**: The [useWPath] hook receives these dimensions, injects user-defined padding variables, and generates a base vector path representing the speech bubble wrapper (e.g., pill, rounded rectangle, or jagged action-burst shapes).
* **Dynamic Tail Generation**: Each WTextGroup schema includes an optional `tailAnchor`: `{ x: number, y: number }` coordinate relative to its parent WPanel. The engine calculates the closest perimeter point on the bubble vector and projects a secondary path sequence (the "tail") that stretches to the anchor target without distorting the main bubble geometry.
#### B. Native Clipping & Synthetic Border Simplification
By lifting both the panel borders and the dialogue bubbles into vector space, Takegumi eliminates layout thrashing caused by calculating absolute DOM segment offsets ([WBorderStrips.tsx]).
* **Border Path Subtraction**: The computed text bubble paths are fed directly into the border engine, which automatically subtracts the intersecting geometry of the text bubble path from the border path, programmatically generating clean visual gaps where text overlaps panel boundaries.
* **Artwork Preservation**: The underlying panel artwork is completely untouched by this clipping process. Speech bubbles are layered above the panel using standard visual stacking (z-index), ensuring that semi-transparent bubble backgrounds display the panel artwork underneath properly without double-rendering or clipping the image itself. This maintains absolute computational accuracy during high-performance layout manipulation or continuous canvas scrolling.
### 3. Alpha-Preserving Text Compositing
To support semi-transparent background colors on speech bubbles without accumulating opacity when multiple bounding boxes intersect, [WTextGroup.tsx] splits rendering into two layers:
* **Layer 1 (Backgrounds Only)**: Renders only the background boxes under a parent-level group opacity style.
* **Layer 2 (Foregrounds Only)**: Renders only text characters, borders, and shadows at 100% solid opacity.
This structure ensures text remains perfectly legible and shadows do not look double-rendered or muddy.
---
## 🧠 Layout & State Mechanics
### 1. State-Level History System (Undo / Redo Archetype)
To provide a robust, lightweight history without bloating memory or performance hiccups, Takegumi utilizes a Linear State-Snapshot Command Stream on top of the persistent state store.
Instead of tracking micro-mutations on an element-by-element basis, the history engine leverages Zustand's immutable structural sharing via `immer`. This guarantees that unaffected nodes share references between history frames, keeping the memory footprint exceptionally low.
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
#### A. Core Mechanics & State Boundary
The history ecosystem explicitly separates Domain State from Ephemeral UI State:
* **Included in History** ([useProjectStore]): Structural modifications to WProjects, WPanels, WTextGroups, and WTextBlocks.
* **Excluded from History** ([useUIStore]): Selection states, side panel toggle states, hovering highlights, and context menu coordinates. This ensures that hitting "Undo" resets the actual canvas layout rather than merely toggling an inspector sidebar tab.
#### B. Commit Strategies & Interaction Filtering
To prevent every single pixel of a drag interaction from pushing a new state onto the history stack, the engine utilizes three distinct commit behaviors:
* **Discrete Commits (Immediate)**: Actions such as deleting a panel, adding a new text bubble, or importing a Markdown script trigger an instantaneous snapshot push.
* **Continuous Commits (Debounced / On-Release)**: Fluid interactions—such as dragging elements or typing text—do not write to the history stack mid-action. Instead, the temporary state updates live in the store, and a history frame is only committed upon interaction termination (e.g., `onDragEnd` from `@dnd-kit` or a 500ms debounce on text entry).
* **Stack Merging**: Consecutive structural property shifts of the exact same element within a tight window are squashed together into a single history frame to avoid timeline fragmentation.
#### C. Maximum Depth & Eviction Policy
To shield the environment from memory exhaustion, the past and future stacks enforce a configurable ceiling constraint (Default: 50 operations). Once this threshold is crossed, the oldest history state undergoes a FIFO (First-In, First-Out) eviction, releasing its references for garbage collection.
### 2. Global Grid Snapping & Smart Guides
The Global Grid Snapping System is a math-driven layout helper operating entirely inside the ephemeral client canvas. Its job is to calculate spatial relationships during movement or resizing transformations, aligning canvas entities (WPanels and WTextGroups) to either a global structural matrix or relative sibling boundaries.
#### A. The Twin Alignment Core
The engine evaluates layout tracking along two independent channels:
* **Absolute Grid Projection**: Maintains a configurable, non-rendering layout grid framework (fixed N px increments). As an element translates across the viewport, its bounding box coordinates are evaluated using a proximity threshold algorithm:
  `Snapped Coordinate = Round (Current Coordinate / Grid Size) * Grid Size.`
* **Relative Sibling Proximity (Smart Guides)**: During active element movement, a specialized spatial query checks the bounding rects of all other active nodes present within the same container context. It evaluates equality thresholds across 6 distinct alignment vectors: Left, Right, Top, Bottom, Vertical Center, and Horizontal Center.
#### B. Pipeline Executions (Transform Phase)
The transformation cycle runs on a strict pipeline during runtime movement updates:
```text
 [Raw Pointer Movement] 
          │
          ▼
 [Extract Box Bounding Rect] 
          │
          ▼
 [Execute Proximity Math Filters] ───> ┌──────────────────────────────┐
                                       │ Threshold Check (< N px)     │
                                       │ & Target Found?              │
                                       └──────────────┬───────────────┘
                                                       │
                                              ┌────────┴────────┐
                                        (Yes) │                 │ (Yes)
                                              ▼                 ▼
                ┌──────────────────────────────┐     ┌──────────────────────────────────┐
                │  Apply Snapped Coordinates   │     │ Inject Guide Paths into UI Store │
                └──────────────────────────────┘     └──────────────────────────────────┘
```
1. **Capture Phase**: `@dnd-kit` or gesture listeners stream raw target coordinate mutations.
2. **Proximity Math Filter**: The system cross-references the raw value against grid coordinates and adjacent sibling edges. If a coordinate falls within the Proximity Snap Threshold (Default: 4px), the raw position is overridden by the snapped coordinate.
3. **State Broadcast**: The overridden coordinates are committed directly to the viewport representation layout.
4. **Visual Guide Injection**: If a relative alignment snap successfully triggers, the snapping engine generates temporary line configuration vectors (e.g., `[{ direction: 'vertical', x: 240 }]`) and injects them directly into [useUIStore].
#### C. Performance Mitigation (Spatial Hashing)
Calculating snapping vectors against dozens of text nodes and layout strips simultaneously on every frame can degrade performance. To avoid $O(N^2)$ computational complexity spikes, Takegumi leverages Spatial Hashing.
The canvas landscape is subdivided into a broad matrix grid. The snapping engine completely ignores elements residing in distant quadrants, calculating alignment paths exclusively against elements sharing the local or immediate adjacent bounding buckets. This maintains solid 60fps visual fidelity on hardware-accelerated layouts.
### 3. Dual-Store State Separation
To maintain blazing-fast rendering speeds and keep saved projects lightweight, Takegumi splits its state into two distinct stores:
* **[useProjectStore]** (Persistent): Manages domain entities like WProjects, WPanels, WTextGroups, and WTextBlocks. It saves data to `localStorage` via localForage (IndexedDB) and handles data schema migrations (e.g. migrating flat text blocks into composite `WTextGroup` models).
* **[useUIStore]** (Ephemeral): Tracks transient runtime parameters such as selection highlights (`selectedWPanelId`, `selectedWTextBlockId`), right-click context menu positions, and active sidebar inspector tabs.
### 4. SSR-Safe Hydration Guard
To prevent mismatch warnings when Next.js compares server-rendered layouts with persisted client storage, the system employs the custom [useHydration] hook. The editor interface delays rendering persistent state elements until hydration has successfully resolved in the client browser.
---
## 📝 Content & Workflow Systems
### 1. Markdown Script Parser
To speed up layout creation, you can write or import a standard text script in Markdown. Takegumi reads it via `src/utils/parseScript.ts` and sets up panels automatically.
#### Syntax & Format Example
```markdown
# Chapter title
[[1]]
This is an automatically created narrative text block in Panel 1.
_Speaker Name_: This is dialogue for the first panel!
[[2]]
_Another Speaker_: Dialogue on Panel 2.
```
* `[[N]]` structures panel divisions.
* `_Character_:` configures dialogue speech boxes.
* Lines without character marks automatically format as narrative blocks.
### 2. Data Models & Schemas
Takegumi operates on a normalized state structure:
* **WProject**: The root document representing a single chapter or webtoon draft.
* **WPanel**: An individual graphic framework holding a background image as well as optional WTextGroups.
* **WTextGroup**: An opacity-unified envelope linking multiple WTextBlocks.
* **WTextBlock**: An individual block containing text content, styling configurations, and transition parameters.
Further Schema Specifications are to be found as YAML files in `/gnd` (ground directory, acting as the single source of truth).
---
## 🛠 Tech Stack
* **Core Framework**: Next.js 16 + App Router
* **Rendering Library**: React 19
* **State Management**: Zustand 5 equipped with `immer` for immutable state mutation and `persist` for LocalStorage synchronization
* **Styling Engine**: Tailwind CSS v4 configured with CSS variables and design tokens in [globals.css]
* **Drag-and-Drop Operations**: `@dnd-kit` (Core, Sortable, and Utilities)
* **Micro-interactions & Fluid UI**: `motion` utilized via `motion/react` for high-performance, hardware-accelerated layout and gesture transitions
* **Storage Medium**: IndexedDB with `localForage`
* **Virtualization Engine**: `@tanstack/react-virtual` for dynamic, variable-height windowing while maintaining 60fps scrolling across infinite vertical layouts
* **Video Rendering Engine**: `remotion` & `@remotion/player` to programmatically orchestrate video rendering for Short Video Format (SVF) exports directly in the client browser