
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
