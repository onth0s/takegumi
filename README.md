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

*   **Storage Medium**: LocalStorage (key: `takegumi-projects`)

---
