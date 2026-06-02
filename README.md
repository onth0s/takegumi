# 🎋 Takegumi — 竹組み

Takegumi is a high-fidelity, web-based content creation and typesetting workstation designed specifically for composing webtoon panels, adding highly styled text overlays, and configuring dynamic transitions. It allows users to compose narrative text, dialogue, and action effects over vertical image strips, style them with advanced typography, animate them, and visually preview the results. As well as Short Video Format (SVF) export capabilities.

The name **Takegumi** (竹組み) refers to the Japanese art of bamboo-framing or assembly, reflecting the tool's focus on structuring panel layouts, borders, and typography into a cohesive sequence.

---

## 🚀 Key Features

*   **Continuous Vertical Canvas**: Simulates a mobile-native webtoon reading flow with intuitive `@dnd-kit`-powered drag-and-drop panel reordering, image file drops, and interactive click-to-upload workflows.

*   **Macro Sequence Grid Overview**: A responsive thumbnail dashboard mapping the structural narrative at a glance.

*   **Immersive Playback Player**: A full-featured test player.

*   **Synthetic Border Carving System**: A dynamic border engine that computes panel borders and cleanly carves out gaps wherever text "bubbles" overlap them, ensuring a clean, modern graphic novel aesthetic.

*   **Alpha-Preserved Text Compositing**: A two-layer rendering pipeline that isolates semi-transparent text bubble backgrounds within groups to prevent ugly overlapping alpha build-up.

*   **Markdown Script Parser**: Automates project setup by converting plain text scripts with markdown panel demarcations (`[[1]]`, `[[2]]`) and speaker lines (`_Speaker_: dialogue`) into fully populated layouts.

---

## 🛠 Tech Stack

*   **Core Framework**: Next.js 16 (App Router)

*   **Rendering Library**: React 19

*   **State Management**: Zustand 5 (equipped with `immer` for immutable state mutation and `persist` for LocalStorage synchronization)

*   **Styling Engine**: Tailwind CSS v4 (configured with CSS variables and design tokens in [globals.css])

*   **Drag-and-Drop Operations**: `@dnd-kit` (Core, Sortable, and Utilities)

* **Micro-interactions & Fluid UI**: `motion` (formerly Framer Motion; utilized via `motion/react` for high-performance, hardware-accelerated layout and gesture transitions)

*   **Storage Medium**: LocalStorage (key: `takegumi-wprojects`)

---

## 🏗 System Architecture & Mechanics

### 1. Dual-Store State Separation
To maintain blazing-fast rendering speeds and keep saved projects lightweight, Takegumi splits its state into two distinct stores:

*   **[useProjectStore]** (Persistent): Manages domain entities like WProjects, WPanels, WTextGroups, and WTextBlocks. It saves data to `localStorage` and handles data schema migrations (e.g. migrating flat text blocks into composite `WTextGroup` models).

*   **[useUIStore]** (Ephemeral): Tracks transient runtime parameters such as selection highlights (`selectedWPanelId`, `selectedWTextBlockId`), right-click context menu positions, and active sidebar inspector tabs.

### 2. SSR-Safe Hydration Guard
To prevent mismatch warnings when Next.js compares server-rendered layouts with persisted client storage, the system employs the custom [useHydration] hook. The editor interface delays rendering persistent state elements until hydration has successfully resolved in the client browser.

### 3. Dynamic Synthetic Borders (`useWBorder`)
Standard CSS outlines and borders are rigid, drawing lines straight through overlying speech bubbles. Takegumi solves this with a custom math engine in the [useWBorder] hook:

1.  It listens to panel and text container boundaries using a debounced `ResizeObserver` and scroll listeners.

2.  It projects the layout of overlay "bubbles" (WTextGroups) onto the four borders of the panel.

3.  Using a **merge-intervals algorithm**, it finds all overlapping intersections along each border segment.

4.  It constructs the borders using absolutely positioned segment elements ([WBorderStrips.tsx]), generating clean, dynamic gaps behind text bubbles.

### 4. Alpha-Preserving Text Compositing
To support semi-transparent background colors on speech bubbles without accumulating opacity when multiple bounding boxes intersect, [WTextGroup.tsx] splits rendering into two layers:

*   **Layer 1 (Backgrounds Only)**: Renders only the background boxes under a parent-level group opacity style.

*   **Layer 2 (Foregrounds Only)**: Renders only text characters, borders, and shadows at 100% solid opacity.
This structure ensures text remains perfectly legible and shadows do not look double-rendered or muddy.


## 🗃 Data Models & Schemas

Takegumi operates on a normalized state structure:

* **WProject**: The root document representing a single chapter or webtoon draft.

* **WPanel**: An individual graphic framework holding a background image as well as optional WTextGroups.

* **WTextGroup**: An opacity-unified envelope linking multiple WTextBlocks.

* **WTextBlock**: An individual block containing text content, styling configurations, and transition parameters.

Further Schema Specifications are to be found as YAML files in /gnd (ground directory, as the single source of truth).

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
