# Takegumi — Codebase Audit & Phased Refactoring Plan

> **Scope**: full audit of `src/`, `gnd/`, `scripts/`, and the top-level
> configuration. Only refactors that earn their keep are listed. The
> codebase is genuinely tight; many findings below are tiny.
>
> **Convention**: Phases execute sequentially. Each ends with a
> "Verification" checklist that the next phase assumes as its baseline.

---

## 1. Executive Summary

Takegumi is a small, well-bounded Next.js 16 + React 19 application with a
deliberate architecture: a YAML single-source-of-truth for data-model
defaults, dual Zustand stores (project + UI), a pure-function render
pipeline for SVG paths, and a memoised inspector tree that writes back
through a draft-mutation recipe pattern.

| Aspect | Verdict |
| --- | --- |
| Type safety (`strict: true`) | Clean. Zero `any`, zero `@ts-ignore`, one `@deprecated` pair properly cross-linked. |
| Tailwind / CSS conventions | Compliant. No `_*` debug classes; no non-standard spacing; `:root` and `@theme` are in sync. |
| State management | Clean dual-store split; history middleware well-encapsulated. |
| Component boundaries | Clear (`canvas` / `layout` / `shared` / `debug`). All sub-folder `index.ts` barrel files present. |
| Dead code | Two inert UI surfaces (Inspector "Defaults" tab, ProjectInspector "Defaults" section) ship no-op controls. |
| Duplication | 4× `endContinuous` arrow; 3× `mutate{Block,Group,Panel}` recipes; 3× `roundTo` + `clamp` math helpers; 2× "create blank" cards. |
| File size | Largest is `projectStore.ts` (306 lines) — manageable. |
| Tests | None. Not required to land refactors, but Phase 7 recommends a smoke harness for pure utils. |
| Lint / typecheck | Configured (ESLint flat config + `tsconfig.json strict`). No `npm run typecheck` script yet — see Phase 7. |

**Net**: this is a refactor plan for cleanliness and consistency, not a
rescue. Each phase is small (≤ ~2 hours of focused work) and reversible.

---

## 2. Audit Findings

### 2.1 What's already good (preserve)

1. **Single source of truth for defaults.** `gnd/schemas/canvas.yaml`
   feeds `scripts/generate-defaults.mjs` →
   `src/constants/_yaml-defaults.generated.ts` →
   `src/constants/canvasDefaults.ts`. The hand-maintained side
   (`canvasDefaults.ts`) is clearly labelled. The build is wired into
   `predev` and `prebuild`.
2. **Pure rendering pipeline.** `pathGenerators.ts`, `snapMath.ts`, and
   `measureText.ts` (scaffold) are pure functions with no React state.
   The hooks `useWPath` and `useSnapping` are thin adapters.
3. **History middleware isolation.** `projectHistory.ts` is a separate
   file with no React or DOM dependencies, kept testable.
4. **`findInProject.ts`** is the single navigation surface for the
   nested `WProject → WPanel → WTextGroup → WTextBlock` tree. All three
   inspectors go through it — no inline `.find` chains outside of
   `useKeyboardShortcuts.ts:55-57` (which is local by design).
5. **`createProject.ts` factory pattern** uses `Partial<T>` overrides
   spread last, with documented precedence rules.
6. **All `use client` directives are placed correctly** (35 client
   files; zero misplaced `"use client"` in server components; zero
   server-only APIs leaking into client code).
7. **`@planned` and `@deprecated` markers** in `types/canvas.ts` and
   `types/ui.ts` are documented and link to `misc/PLAN.md`.
8. **Inspector files use `memo()`** to prevent re-render cascades from
   the project store. Selection-derived props stay referentially stable
   between mutations.
9. **CSS theme architecture** strictly follows `AGENTS.md §Theme
   colors`: every color lives in `:root` as `--_<name>`, is mirrored
   in `@theme` via `var(--_<name>)`, and is documented in the
   `// Surface palette`, `// Borders`, etc. comments.
10. **Tailwind 4 `@utility`** is used appropriately (`bg-grid`,
    `bg-grid-light`, `no-scrollbar`, `animate-panel-fade-in`).

### 2.2 Inert / dead code (mechanical removal)

| # | File | Lines | Issue |
| --- | --- | --- | --- |
| 1 | `src/components/layout/Editor/Inspector.tsx` | 68–82 | The `projectTab === "defaults"` branch renders `ScrubInput` controls with `onChange={() => {}} onCommit={() => {}}`. The controls cannot mutate anything; the surrounding text says "Edit in canvasDefaults.ts". |
| 2 | `src/components/layout/Editor/inspector/ProjectInspector.tsx` | 116–128 | Same inert "Defaults" section, duplicated. |
| 3 | `src/utils/panelImageStorage.ts` | 4 | `toLocalImageUrl` is only consumed by `processImageFiles.ts:8`. Single consumer — fine to keep, but worth a note. |
| 4 | `src/components/layout/Home/recents/panelCountLabel.ts` | 1–3 | A 3-line helper that does one string concat. Used twice (`ProjectCard.tsx`, `ProjectRow.tsx`). Inlining is fine; keeping it is also fine. **No action** — leave as-is unless more formatters are added. |

### 2.3 Duplication (DRY, low risk)

| # | Pattern | Locations | Lines / file |
| --- | --- | --- | --- |
| 1 | `const endContinuous = () => useProjectStore.getState().endContinuousCommit();` | `PanelInspector.tsx:60`, `TextBlockInspector.tsx:63`, `TextGroupInspector.tsx:70`, `ProjectInspector.tsx:25` | 1 each, 4 total |
| 2 | `mutate{Panel,Group,Block} = useCallback((recipe, commitType) => updateProject(draft => { const x = findX(draft, ...); if (x) recipe(x); }, commitType, elementId), [...])` | `PanelInspector.tsx:26-38`, `TextBlockInspector.tsx:34-46`, `TextGroupInspector.tsx:35-47` | ~10 each, 3 total |
| 3 | `function roundTo(value, decimals)` and `function clamp(value, min, max)` | `ScrubInput.tsx:5-12`, `SmartNumberInput.tsx:5-12`, `SmartSlider.tsx:5-12` | 8 each, 3 total |
| 4 | Pointer-drag state machine (`dragging.current`, `startX`, `startValue`, `isScrubbing`, `setPointerCapture`, `releasePointerCapture`, `Math.abs(dx) > 3` dead-zone) | `ScrubInput.tsx:42-106`, `SmartSlider.tsx:45-105` | ~60 each |
| 5 | "Create blank" card markup (rounded-xl, dashed border, plus icon, two-line label) | `WProject.tsx:86-106`, `Home/Center.tsx:49-69` | ~20 each |
| 6 | Status bar / viewport inline sub-components | `Viewport.tsx:10-23` (`UndoRedoBtn`), `StatusBar.tsx:8-65` (`InlineProjectName`) | 13 / 58 |

### 2.4 Type / hook polish (cosmetic)

| # | File | Issue |
| --- | --- | --- |
| 1 | `src/hooks/useElementDimensions.ts:6` | `deps: unknown[]` is too loose. The function treats it as a React dependency array; `ReadonlyArray<unknown>` matches `useEffect`/`useMemo` semantics. |
| 2 | `src/utils/measureText.ts:18, 52` | `fontWeight: string \| number` is read into a canvas font string; the `number` branch is never exercised in this file. Tighten to `string`. |
| 3 | `src/components/layout/Editor/inspector/ProjectInspector.tsx:27-71` | Five `useCallback`s that all depend on `[updateProject]`. Can collapse into one helper. **Not urgent** — readability is fine. |
| 4 | `src/hooks/useKeyboardShortcuts.ts:102-111` | 7-element `useEffect` dependency list reads seven store slices. Functionally correct, but `useRef` snapshot of the relevant IDs at handler-bind time keeps the handler stable across renders. Low priority. |

### 2.5 Out of scope (the README's roadmap, not refactors)

These are *features*, not refactors, and are explicitly out of scope:

- `@dnd-kit` drag-and-drop wiring (README §"Planned" → Tech Stack).
- `useWPath` migration from `ResizeObserver` to the `measureText.ts`
  scaffold (README §1.2.A; `measureText.ts:3-4` documents this).
- Animation editor + Remotion playback transitions
  (`WTextBlock.transition` is `@deprecated` in `types/canvas.ts:15`).
- Macro sequence grid overview / immersive playback player.
- Markdown script parser.
- Sidebar tabs beyond `inspector` (`SidebarTab = "inspector" | "assets" | "script" | "history"` is declared in `types/ui.ts:15` but only `inspector` is implemented).
- Synthetic border engine subtraction (`WBorderStrips` referenced in README §2.B does not exist as a component; the `WPanel` border is currently CSS-based).

---

## 3. Phased Refactoring Plan

Each phase ends with a `Verification` block. The next phase starts only
after its predecessor's verification passes. **Do not batch phases.**

### Phase 1 — Dead code removal

**Goal**: remove inert UI that ships no-op controls.

**Where**:
- `src/components/layout/Editor/Inspector.tsx` (lines 67–82 and 83–102):
  remove the `projectTab === "defaults"` and `projectTab === "info"`
  branches. `Inspector.tsx` now only has two states: project view
  (`projectTab === "canvas"`) and entity view (block / group / panel).
- `src/components/layout/Editor/inspector/ProjectInspector.tsx` (lines
  116–128): remove the local "Defaults" section — it was a
  no-op duplicate of the Inspector tab.
- `src/components/layout/Editor/Inspector.tsx` (lines 40, 110, 112–121):
  with the tabbed states gone, the `projectTab` state and
  `SegmentedControl` for project tabs also go. Replace the `Project`
  inspector content with a direct `<ProjectInspector />` render.
- `src/components/layout/Editor/inspector/ProjectInspector.tsx` (lines
  22–23, 27–34): the `handleNameChange` is the only writer of the
  project name; keep it. The `InspectorInput` for "Name" becomes the
  default top field.

**Why this phase first**: it is purely subtractive. Zero risk of
regression. Frees the Inspector from a layer of conditional rendering
that was load-bearing for nothing.

**Tasks**:
1. Delete the two `projectTab` branches in `Inspector.tsx`.
2. Delete the `SegmentedControl` import in `Inspector.tsx` if it has no
   other consumer (it does not — `ScrubInput` and `EmptyInspectorState`
   remain).
3. Delete the "Defaults" `InspectorSection` in `ProjectInspector.tsx`.
4. Delete the now-unused `ProjectTab` type alias and `projectTab` state.
5. Delete the `handleThemeChange` "discrete" commit (it already exists).
   Wait — keep it; it is wired to the `SegmentedControl` in the
   "Canvas" section of `ProjectInspector.tsx:105-114`. **No deletion.**

**Verification**:
- `npm run lint` — clean.
- `npx tsc --noEmit` — clean.
- `npm run build` — clean.
- Manual: open workspace, confirm Inspector switches between Project,
  Panel, Group, Block correctly. Confirm no console errors.

---

### Phase 2 — Inspector mutation hooks (DRY)

**Goal**: replace the four-times-repeated `endContinuous` arrow and
three-times-repeated `mutate*` recipe pattern with two small hooks.

**Where**:
- New file: `src/hooks/useEndContinuous.ts`
  ```ts
  export function useEndContinuous(): () => void {
    return () => useProjectStore.getState().endContinuousCommit();
  }
  ```
  (This is intentionally a no-op wrapper today; its real value is
  preparing for the future where commit flushing might move off
  `useProjectStore.getState()` into a dedicated `useDraftHistory` hook.
  See Phase 2.5 of the roadmap if it ever materialises.)
- New file: `src/hooks/useDraftMutation.ts`
  ```ts
  type ElementId = { panelId: string; groupId?: string; blockId?: string };

  export function useDraftMutation(
    ids: ElementId,
    options?: { defaultCommit?: "discrete" | "continuous" }
  ) {
    const updateProject = useProjectStore((s) => s.updateProject);
    const find = useMemo(() => makeFinder(ids), [ids.panelId, ids.groupId, ids.blockId]);
    return useCallback(
      (recipe: (target: any) => void, commitType?: "discrete" | "continuous") => {
        updateProject(
          (draft) => {
            const target = find(draft);
            if (target) recipe(target);
          },
          commitType ?? options?.defaultCommit ?? "continuous",
          ids.blockId ?? ids.groupId ?? ids.panelId
        );
      },
      [updateProject, find, ids.blockId, ids.groupId, ids.panelId, options?.defaultCommit]
    );
  }
  ```
  (The `any` is acceptable here because the target shape varies by
  `ElementId`. An alternative is to use overloads; Phase 2 ships the
  simpler version and a follow-up overload PR if it earns its keep.)

**Tasks**:
1. Create `src/hooks/useEndContinuous.ts` and `src/hooks/useDraftMutation.ts`.
2. In `PanelInspector.tsx`: replace `mutatePanel` (lines 26–38) with
   `useDraftMutation({ panelId: panel.id })`, and `endContinuous`
   (line 60) with `useEndContinuous()`. Keep `handleDelete` and
   `handleAddTextGroup` as-is (they call `updateProject` directly with
   a custom element id of the panel).
3. Same edit in `TextBlockInspector.tsx` (lines 34–46, 63) and
   `TextGroupInspector.tsx` (lines 35–47, 70).
4. In `ProjectInspector.tsx` (line 25): replace the local
   `endContinuous` arrow with `useEndContinuous()`.

**Verification**:
- `npm run lint` — clean.
- `npx tsc --noEmit` — clean.
- `npm run build` — clean.
- Manual smoke: rename project, drag a slider, type into a textarea,
  change a color, change a font family. Each must end with a single
  undo step in history (discrete vs. continuous behaviour preserved).
- Manual smoke: keyboard `Delete` removes a selected panel / group /
  block. Behaviour unchanged.

---

### Phase 3 — Shared numeric utilities

**Goal**: deduplicate `roundTo` and `clamp`.

**Where**:
- New file: `src/utils/math.ts`
  ```ts
  export function roundTo(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }
  export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
  ```
- Edit `src/components/shared/UI/ScrubInput.tsx` (lines 5–12):
  delete the two helpers; import from `@/utils/math`.
- Edit `src/components/shared/UI/SmartNumberInput.tsx` (lines 5–12):
  same.
- Edit `src/components/shared/UI/SmartSlider.tsx` (lines 5–12):
  same. Also move the `snapToSteps` reducer (lines 14–18) to
  `src/utils/math.ts` as `snapToNearest(value, steps)`.

**Tasks**:
1. Create `src/utils/math.ts` with `roundTo`, `clamp`, `snapToNearest`.
2. Update the three UI files to import from `@/utils/math` and remove
   the local copies.
3. `snapToNearest` in `SmartSlider.tsx:120-122` uses the same algorithm
   inline; replace with the shared helper.

**Verification**:
- `npm run lint` — clean.
- `npx tsc --noEmit` — clean.
- `npm run build` — clean.
- Manual: open the Inspector; drag a slider, scrub a number, arrow-step
  a number with `Shift` and `Ctrl` modifiers. Behaviour identical.

---

### Phase 4 — Smart-input pointer-drag unification (conservative)

**Goal**: extract the shared pointer-drag state machine from
`ScrubInput` and `SmartSlider` into a single hook without changing
either component's visual or API surface.

**Why conservative**: the two components have *similar* but not
*identical* state machines. `ScrubInput` has an "edit mode" toggle on
`pointerUp` if the user did not drag past the 3px dead-zone;
`SmartSlider` does not. Merging them entirely would either bloat
`SmartSlider` with an edit mode or strip `ScrubInput` of one of its
distinguishing features. The conservative path keeps both components
and shares only the part that *is* identical.

**Where**:
- New file: `src/hooks/usePointerDrag.ts`
  ```ts
  interface PointerDragOptions {
    onStart?: (e: React.PointerEvent) => void;
    onDrag: (dx: number, e: React.PointerEvent) => void;
    onEnd: (dragged: boolean, e: React.PointerEvent) => void;
    deadZone?: number; // default 3
  }

  export function usePointerDrag(options: PointerDragOptions) {
    const state = useRef({ startX: 0, isDragging: false, active: false });
    // returns { onPointerDown, onPointerMove, onPointerUp }
  }
  ```
- Edit `src/components/shared/UI/ScrubInput.tsx` (lines 42–106):
  replace the local `scrubRef` state machine with the hook. Keep the
  `editing` mode toggle inside the `onEnd` callback (the hook reports
  `dragged: boolean`).
- Edit `src/components/shared/UI/SmartSlider.tsx` (lines 45–105):
  same swap. `SmartSlider` does not have an edit mode, so its `onEnd`
  ignores `dragged`.

**Tasks**:
1. Create `src/hooks/usePointerDrag.ts`.
2. Refactor `ScrubInput.tsx` to use it.
3. Refactor `SmartSlider.tsx` to use it.
4. The `fineStep` / `ctrlSteps` / `e.shiftKey` / `e.ctrlKey` modifier
   logic stays in each component — that is the part that genuinely
   differs.

**Verification**:
- `npm run lint` — clean.
- `npx tsc --noEmit` — clean.
- `npm run build` — clean.
- Manual: drag a SmartSlider, scrub a ScrubInput, click (without drag)
  a ScrubInput to enter edit mode, then click outside to commit. All
  four behaviours must match the pre-refactor behaviour exactly.

---

### Phase 5 — Component extraction (small, mechanical)

**Goal**: pull inline sub-components into their own files so the host
files focus on composition.

**Where**:
- New file: `src/components/layout/Editor/UndoRedoBtn.tsx` — extracted
  from `Viewport.tsx:10-23`.
- New file: `src/components/layout/Editor/InlineProjectName.tsx` —
  extracted from `StatusBar.tsx:8-65`. Re-exported from
  `StatusBar.tsx` so the StatusBar test surface is unchanged.
- New file: `src/components/shared/CreateBlankCard.tsx` — extracted
  from `WProject.tsx:86-106` and `Home/Center.tsx:49-69`. The two
  call sites use slightly different sizing (`h-200` / `h-64`,
  `flex-1` / `flex-[3.5]`, etc.) — make `className` a prop and
  drop the wrapping `<div>` differences on the caller side.
  Acceptable simplification since the two existing call sites
  differ only in proportions and labels.
- Update `src/components/layout/Editor/index.ts` to re-export the two
  new files if any other file imports them via the barrel (it does
  not, but the convention is maintained).

**Tasks**:
1. Extract `UndoRedoBtn`.
2. Extract `InlineProjectName`.
3. Extract `CreateBlankCard` with `label: string`, `sublabel: string`,
   `onClick: () => void`, `className?: string`. Keep accessibility
   (role, tabIndex, keyboard handler).
4. Update both call sites.

**Verification**:
- `npm run lint` — clean.
- `npx tsc --noEmit` — clean.
- `npm run build` — clean.
- Manual: undo/redo, double-click project name to rename, click
  "Create blank project" on Home, click "Create blank WPanel" in the
  editor. Each must behave identically to the pre-refactor version.

---

### Phase 6 — Type & hook polish

**Goal**: tighten three small type signatures and a doc comment.

**Where**:
- `src/hooks/useElementDimensions.ts:6` — change `deps: unknown[]` to
  `deps: ReadonlyArray<unknown>`. The body uses `...deps` to spread
  into the dependency array, which works for both.
- `src/utils/measureText.ts:18, 52` — change `fontWeight?: string |
  number` to `fontWeight?: string` (the `number` branch is dead in
  this file).
- `src/types/canvas.ts:15-19, 25-26` — the `WTextBlockTransition`
  type is `@deprecated` and unreferenced. Either:
  - **option A (preferred)**: leave it but update the JSDoc to point
    to the README's Phase 5 ("Animation Editor + Remotion") instead
    of the non-existent "Playback transitions — not implemented
    until Remotion export", and ensure the JSDoc on `WTextBlock.transition`
    (line 25) cross-links to `WTextBlockTransition`. Both already do
    this — **no action**.
- `src/components/layout/Editor/inspector/InspectorFields.tsx:130-132`
  — the `FieldLabel` export is unused. Either consume it from one
  inspector or remove the export. (Default: remove.)

**Tasks**:
1. Tighten `useElementDimensions` deps type.
2. Tighten `measureText.fontWeight` type.
3. Remove the unused `FieldLabel` export from `InspectorFields.tsx`.

**Verification**:
- `npm run lint` — clean.
- `npx tsc --noEmit` — clean.
- `npm run build` — clean.

---

### Phase 7 — Verification harness & developer ergonomics

**Goal**: add a `typecheck` script and a one-shot pure-util smoke
harness so future refactors land with a safety net. *Optional* — does
not block earlier phases.

**Where**:
- `package.json` — add:
  ```json
  "typecheck": "tsc --noEmit"
  ```
- New file: `scripts/smoke-pure.mjs` — a Node script that exercises
  `pathGenerators.ts`, `snapMath.ts`, and (the pure parts of)
  `measureText.ts` against a few golden values. Run with
  `node --experimental-strip-types scripts/smoke-pure.mjs` on Node ≥22,
  or with `tsx scripts/smoke-pure.mjs` if `tsx` is added to
  devDependencies.
  Coverage target: ≥ one assertion per public function in the two
  pure modules. The script is not a unit test framework; it is a
  regression tripwire.
- (Optional) `AGENTS.md` — append a short note instructing future
  agents to run `npm run typecheck && npm run lint` before claiming
  a refactor is complete.

**Tasks**:
1. Add the `typecheck` script.
2. Add the smoke script with golden cases.
3. Wire the smoke script into a new `npm run verify` script.
4. Append the AGENTS.md note.

**Verification**:
- `npm run typecheck` — exits 0.
- `npm run lint` — exits 0.
- `npm run verify` — exits 0.
- `npm run build` — exits 0.

---

## 4. Refactor Impact Summary

| Phase | Files touched (rough) | LoC delta (rough) | Risk |
| --- | --- | --- | --- |
| 1 — Dead code | 2 | −35 | Negligible (deletion) |
| 2 — Inspector hooks | 5 (1 new, 4 edits) | +20 | Low |
| 3 — Math utils | 4 (1 new, 3 edits) | −15 | Negligible |
| 4 — Pointer-drag hook | 3 (1 new, 2 edits) | −20 | Medium (must preserve edit mode in ScrubInput) |
| 5 — Component extraction | 6 (3 new, 3 edits) | +30 (mostly moved code) | Low |
| 6 — Type polish | 2 | −2 | Negligible |
| 7 — Verify harness | 3 (1 new, 1 new script, package.json, AGENTS.md) | +60 | Negligible |
| **Total** | ~20 files | +38 net | All phases reversible individually |

---

## 5. Order of Execution (rationale)

1. **Phase 1 first** because deletions are the safest change and
   reduce the surface area for every subsequent phase.
2. **Phase 2 before Phase 3** because the inspector mutation hook is
   the *only* place that will benefit from a stable commit-flushing
   surface; getting that abstraction right before refactoring the
   numeric primitives keeps the diff scoped.
3. **Phase 3 before Phase 4** because the `usePointerDrag` hook will
   itself use `clamp` / `roundTo` indirectly; importing from
   `@/utils/math` is cleaner than duplicating again.
4. **Phase 4 in the middle** because the pointer-drag hook touches
   two large files; doing it after the smaller refactors minimises
   the chance of merge conflicts.
5. **Phase 5** is pure file-level moves; doing it after Phase 4 means
   `Viewport.tsx` and `StatusBar.tsx` are already smaller and easier
   to scan.
6. **Phase 6** is a sweep of cosmetic cleanups that became apparent
   only after the larger refactors settled.
7. **Phase 7 last** because adding a verifier benefits from a
   post-refactor baseline.

---

## 6. Appendix — Decision Log

- **Why no `tests/` directory was added earlier in the plan.** The
  pure-function surface is small (`pathGenerators.ts`, `snapMath.ts`,
  `measureText.ts`, `panelImageStorage.ts`, `createProject.ts`,
  `findInProject.ts`, `projectList.ts`, `snapMath.ts`, `uid.ts`). A
  Vitest harness would add ~10 devDependencies for ~12 functions.
  Phase 7 ships a hand-rolled smoke script instead. If the pure
  surface grows, a Vitest migration is straightforward.
- **Why `useDraftMutation` ships with `any` on the recipe argument.**
  The target shape varies by `ElementId` (`WPanel` vs. `WTextGroup` vs.
  `WTextBlock`). Three overloads would be possible but would not
  reduce the surface area meaningfully; consumers still have to
  branch on the `ElementId` shape. The simpler form is preferred.
- **Why `useEndContinuous` is a one-liner hook.** It encapsulates a
  cross-store read (`useProjectStore.getState()`) that the rest of
  the codebase should not need to know about. If the history system
  ever moves to a context-based or sharded store, the hook is the
  single point of change.
- **Why no `useDraftHistory` was added.** The four call sites of
  `endContinuous` already use `useProjectStore.getState().endContinuousCommit`
  directly. Hoisting it to a hook is enough; a fuller
  `useDraftHistory` would import from `projectHistory.ts` and add
  visible state in the React tree, which is premature.
- **Why the synthetic border engine and `WBorderStrips` are not in
  scope.** They are referenced in the README but no component, hook,
  or utility implements them. Implementing them is a feature, not a
  refactor. The refactor plan does not retrofit their absence.
- **Why the Markdown script parser and `@dnd-kit` are not in scope.**
  Same reasoning — they are README items, not refactor candidates.
- **Why the `@deprecated` `WTextBlock.transition` field was not
  removed.** It is `@planned` for the Remotion export pipeline
  (README §"Planned"). Removing the type now would force a future
  migration that is not yet motivated.
