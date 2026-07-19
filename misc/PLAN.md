# Takegumi -- Refactoring Implementation Plan

> Generated from full codebase audit on 2026-07-19.
> Each phase is self-contained and shippable. Execute sequentially.

---

## Audit Summary

### Codebase Snapshot
| Metric | Value |
|---|---|
| Source files (`.ts`/`.tsx`) | ~60 |
| Total LoC (src/) | ~4,500 |
| Components | 38 |
| Hooks | 10 |
| Utils | 17 |
| Tests | 5 files |
| Stores | 4 (projectStore, uiStore, projectHistory, storeSync) |

### Strengths (Preserve)
- Clean domain/UI state separation (`projectStore` vs `uiStore`)
- YAML schema → TypeScript codegen pipeline (`canvas.yaml` → `_yaml-defaults.generated.ts`)
- React Compiler enabled; Immer-backed immutable mutations
- Barrel exports (`components/canvas/index.ts`, `shared/UI/index.ts`)
- Lazy-loaded inspectors via `React.lazy` + `Suspense`
- Type-overloaded `useMutateEntity` hook with scope safety

### Key Findings Requiring Attention

| # | Issue | Severity | Files Affected |
|---|---|---|---|
| 1 | `useWBorder` is a 266-line mega-hook mixing subscription, geometry, and SVG computation | High | `useWBorder.ts` |
| 2 | `WTextGroup` and `WPanel` over-subscribe to stores (`project` just for a single boolean) | Medium | `WTextGroup.tsx`, `WPanel.tsx` |
| 3 | `WBorder.tsx` uses raw `document.getElementById` for portals — fragile, not SSR-safe | Medium | `WBorder.tsx` |
| 4 | Duplicate count computations (panel/group/block counts recalculated in 3+ places) | Low | `StatusBar.tsx`, `Inspector.tsx`, `projectStore.ts` |
| 5 | Inline `UndoRedoBtn` defined inside `Viewport.tsx`, unused elsewhere | Low | `Viewport.tsx` |
| 6 | `createTextBlock` spread pattern can silently overwrite nested `style` properties | Medium | `createProject.ts` |
| 7 | Intersection-check logic duplicated between `useWBorder` rect-hash and `computeMaskRects` | Medium | `useWBorder.ts` |
| 8 | No error boundaries around canvas or inspector subtrees | Medium | `WProject.tsx`, `Inspector.tsx` |
| 9 | `useKeyboardShortcuts` delete logic duplicates entity removal patterns found in inspectors | Low | `useKeyboardShortcuts.ts` |
| 10 | No `tsconfig` path for `@gnd/*` — schema imports use relative paths | Low | `tsconfig.json` |
| 11 | `globals.css` dark-mode-only but variable structure implies multi-theme intent | Low | `globals.css` |

---

## Phase 1: Store Hygiene & Selector Optimization

**Goal:** Reduce unnecessary re-renders by tightening Zustand selectors and eliminating over-subscriptions.

### 1.1 -- Extract derived selectors into `projectStore`

Move repeated count computations into memoized store selectors.

```ts
// src/stores/projectStore.ts — add these selectors
export const selectPanelCount = (s: ProjectState) => s.project?.panels.length ?? 0;
export const selectGroupCount = (s: ProjectState) =>
  s.project?.panels.reduce((sum, p) => sum + p.textGroups.length, 0) ?? 0;
export const selectBlockCount = (s: ProjectState) =>
  s.project?.panels.reduce((sum, p) =>
    sum + p.textGroups.reduce((gs, g) => gs + g.blocks.length, 0), 0) ?? 0;
```

**Files modified:**
- `src/stores/projectStore.ts` -- add selector exports
- `src/components/layout/Editor/StatusBar.tsx` -- consume selectors instead of inline reduce
- `src/components/layout/Editor/Inspector.tsx` -- consume selectors instead of inline reduce
- `src/components/layout/Editor/Viewport.tsx` -- use `selectPanelCount` for empty-project detection

### 1.2 -- Stop `WPanel` from subscribing to full `project`

`WPanel` subscribes to `s.project` solely to read `disableSyntheticBorder`. Pass it as a prop from `PanelLayer`.

```ts
// PanelLayer.tsx -- pass disableSyntheticBorder as prop
<WPanel panel={p} disableSyntheticBorderGlobal={project.disableSyntheticBorder} />
```

**Files modified:**
- `src/components/canvas/WProject/PanelLayer.tsx` -- pass prop
- `src/components/canvas/WPanel/WPanel.tsx` -- accept prop, remove `useProjectStore` subscription

### 1.3 -- Stop `WTextGroup` from subscribing to full `project`

`WTextGroup` subscribes to `s.project` to check `panel.borderEnabled` and `panel.disableSyntheticBorder`. Compute this in the parent (`TextGroupLayer`) and pass down.

**Files modified:**
- `src/components/canvas/WProject/TextGroupLayer.tsx` -- precompute `panelBorderEnabled` per panel, pass as context/prop
- `src/components/canvas/WTextGroup/WTextGroup.tsx` -- accept `panelBorderEnabled` prop, remove store subscription

### 1.4 -- Tighten `StatusBar` selectors

`StatusBar` currently subscribes to `past` and `future` arrays directly (causing re-renders on every keystroke). Replace with length checks.

**Files modified:**
- `src/components/layout/Editor/StatusBar.tsx` -- use `s.past.length` and `s.future.length` selectors

---

## Phase 2: Decompose `useWBorder` Mega-Hook

**Goal:** Break the 266-line `useWBorder` into focused, testable units.

### 2.1 -- Extract `computeUnionPath` pure function

Move the polygon-union computation out of the hook into a pure utility.

```ts
// src/utils/borderUnion.ts (new file)
export function computeUnionPath(
  panel: WPanel,
  textGroupRects: Map<string, DOMRect>,
  bw: number,
): string { ... }
```

This function:
- Iterates `panel.textGroups` in union mode
- Discretizes each bubble + tail into polygons
- Merges via `unionTwoPolygons`
- Returns the SVG path string

**Files modified:**
- `src/utils/borderUnion.ts` -- new file, extracted pure logic
- `src/hooks/useWBorder.ts` -- call `computeUnionPath` inside `useLayoutEffect`

### 2.2 -- Extract `computeMaskRects` pure function

```ts
// src/utils/borderUnion.ts (append to above)
export function computeBorderMaskRects(
  panel: WPanel,
  allPanels: WPanel[],
  textGroupRects: Map<string, DOMRect>,
  hideAllText: boolean,
): { x: number; y: number; w: number; h: number }[] { ... }
```

**Files modified:**
- `src/utils/borderUnion.ts` -- append function
- `src/hooks/useWBorder.ts` -- call extracted function

### 2.3 -- Extract intersection check helper

The "does text group overlap panel" check is duplicated in the rect-hash and `computeMaskRects`. Extract:

```ts
// src/utils/geometry.ts (new file)
export function rectsOverlap(
  groupLocalRect: { left: number; right: number; top: number; bottom: number },
  panelWidth: number,
  panelHeight: number,
): boolean {
  return groupLocalRect.left < panelWidth
    && groupLocalRect.right > 0
    && groupLocalRect.top < panelHeight
    && groupLocalRect.bottom > 0;
}
```

**Files modified:**
- `src/utils/geometry.ts` -- new file
- `src/hooks/useWBorder.ts` -- use `rectsOverlap` in both rect-hash and `computeMaskRects`

### 2.4 -- Simplify `useWBorder` to composition

After extraction, `useWBorder` should be ~80 lines: subscription setup, `useLayoutEffect` calling pure functions, `ResizeObserver` lifecycle.

**Files modified:**
- `src/hooks/useWBorder.ts` -- rewritten as thin orchestrator

---

## Phase 3: Portal Safety & SSR Robustness

**Goal:** Eliminate raw `document.getElementById` calls and add error boundaries.

### 3.1 -- Replace `document.getElementById` with React refs

`WBorder.tsx` calls `document.getElementById("panel-borders-portal-target")` and `document.getElementById("panel-selection-portal-target")` on every render. Replace with a context-provided ref.

```ts
// src/components/canvas/WProject/PortalContext.tsx (new file)
const PortalContext = createContext<{
  borderTarget: HTMLElement | null;
  selectionTarget: HTMLElement | null;
}>({ borderTarget: null, selectionTarget: null });

export function usePortalTargets() {
  return useContext(PortalContext);
}
```

**Files modified:**
- `src/components/canvas/WProject/PortalContext.tsx` -- new file
- `src/components/canvas/WProject/PortalTargets.tsx` -- provide context values via refs
- `src/components/canvas/WPanel/WBorder.tsx` -- consume `usePortalTargets()` instead of `document.getElementById`

### 3.2 -- Add `ErrorBoundary` wrapper

Create a reusable error boundary and wrap the canvas subtree and inspector.

```ts
// src/components/shared/ErrorBoundary.tsx (new file)
export class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> { ... }
```

**Files modified:**
- `src/components/shared/ErrorBoundary.tsx` -- new file
- `src/components/layout/Editor/Viewport.tsx` -- wrap `<WProject>` in `<ErrorBoundary>`
- `src/components/layout/Editor/Inspector.tsx` -- wrap `<Suspense>` content in `<ErrorBoundary>`

---

## Phase 4: Factory Function Safety

**Goal:** Prevent silent data corruption in entity creation.

### 4.1 -- Fix `createTextBlock` spread order

Currently `...overrides` is spread at the top level, which can replace the entire `style` object if `overrides.style` is provided. Change to deep-merge:

```ts
export function createTextBlock(overrides?: Partial<WTextBlock>): WTextBlock {
  const defaults: WTextBlock = {
    id: uid(),
    text: "Text Block",
    style: {
      fontSize: DEFAULT_WTB_FONT_SIZE,
      fontWeight: DEFAULT_WTB_FONT_WEIGHT,
      color: DEFAULT_WTB_COLOR,
      textAlign: DEFAULT_WTB_TEXT_ALIGN,
      opacity: DEFAULT_WTB_OPACITY,
    },
  };
  if (!overrides) return defaults;
  return {
    ...defaults,
    ...overrides,
    style: { ...defaults.style, ...overrides.style },
  };
}
```

**Files modified:**
- `src/utils/createProject.ts` -- fix `createTextBlock`, `createTextGroup`, and `createBlankPanel` spread patterns

### 4.2 -- Fix `createTextGroup` spread order

Same pattern -- `style` spread must be nested:

```ts
return {
  ...groupDefaults,
  ...overrides,
  style: { ...groupDefaults.style, ...overrides?.style },
  blocks: overrides?.blocks ?? groupDefaults.blocks,
};
```

### 4.3 -- Fix `createBlankPanel` spread order

`style` and `textGroups` must not be silently replaced:

```ts
return {
  ...panelDefaults,
  ...overrides,
  style: { ...panelDefaults.style, ...overrides?.style },
  textGroups: overrides?.textGroups ?? panelDefaults.textGroups,
};
```

---

## Phase 5: Keyboard Shortcuts Consolidation

**Goal:** Unify delete logic and prepare for extensible shortcut system.

### 5.1 -- Extract `deleteSelectedEntity` helper

The delete logic in `useKeyboardShortcuts` duplicates patterns found in `PanelInspector.handleDelete` and `TextGroupInspector.handleDelete`. Extract a shared helper:

```ts
// src/utils/deleteEntity.ts (new file)
export function deleteSelectedEntity(
  project: WProject,
  selectedPanelId: string | null,
  selectedGroupId: string | null,
  selectedBlockId: string | null,
): { nextProject: WProject; clearedSelection: boolean } | null { ... }
```

**Files modified:**
- `src/utils/deleteEntity.ts` -- new file
- `src/hooks/useKeyboardShortcuts.ts` -- call `deleteSelectedEntity` + `updateProject`

### 5.2 -- Make shortcut handler registry-based (optional stretch)

Convert the `useKeyboardShortcuts` if/else chain into a map for extensibility:

```ts
const shortcuts: ShortcutDef[] = [
  { mod: true, key: "z", shift: false, action: () => undo() },
  { mod: true, key: "z", shift: true, action: () => redo() },
  { mod: true, key: "Z", shift: false, action: () => redo() },
  { key: "Escape", action: () => clearSelection() },
  { key: "Delete", action: handleDelete },
  { key: "Backspace", action: handleDelete },
];
```

**Files modified:**
- `src/hooks/useKeyboardShortcuts.ts` -- refactor to registry pattern

---

## Phase 6: CSS & Theme Hardening

**Goal:** Clean up Tailwind utilities and prepare for potential multi-theme support.

### 6.1 -- Remove debug underscore classes

Per `AGENTS.md` rules, scan and remove all `*_` debug classes (e.g., `bg-blue-200_`).

**Files modified:** Any component using debug classes (grep for `_\b` in className strings).

### 6.2 -- Replace non-standard spacing utilities

Per `AGENTS.md`, replace `mt-26`, `gap-26`, etc. with nearest standard values (`mt-24` or `mt-28`).

**Files modified:** Any file using non-standard Tailwind spacing.

### 6.3 -- Document theme variable conventions in CSS

Add a header comment block to `globals.css` explaining the `:root` ↔ `@theme` sync contract and the VS Code color swatch workaround.

**Files modified:**
- `src/styles/globals.css` -- add documentation block at top

---

## Phase 7: Type Safety & Schema Alignment

**Goal:** Strengthen the type ↔ schema contract and add missing types.

### 7.1 -- Add `@gnd/*` path alias

```json
// tsconfig.json
"paths": {
  "@/*": ["./src/*"],
  "@styles/*": ["./src/styles/*"],
  "@gnd/*": ["./gnd/*"]
}
```

**Files modified:**
- `tsconfig.json` -- add path alias

### 7.2 -- Audit `canvas.ts` types against `canvas.yaml`

Verify every property in `canvas.yaml` has a corresponding TypeScript field. Key gaps found:

| YAML Property | TypeScript Status |
|---|---|
| `WTextGroup.tailAnchorBlockId` | Marked `@planned` in YAML, present as optional in TS -- OK |
| `WPanel.style` | Optional in TS, not in YAML -- align |
| `WTextBlock.style.fontFamily` | Optional in TS, no default in YAML -- OK |
| `WTextBlock.style.lineHeight` | Optional in TS, no default in YAML -- OK |

**Files modified:**
- `src/types/canvas.ts` -- add JSDoc `@since` annotations for planned fields
- `gnd/schemas/canvas.yaml` -- add `@planned` annotation to `WPanel.style` if intentionally optional

### 7.3 -- Add `WPanel.style` defaults to schema

`WPanel.style` exists in types but has no entry in `canvas.yaml`. Add:

```yaml
WPanel:
  properties:
    style:
      type: object
      properties:
        freeX:
          type: boolean
          default: false
        freeY:
          type: boolean
          default: false
        freeWidth:
          type: boolean
          default: false
```

**Files modified:**
- `gnd/schemas/canvas.yaml` -- add `WPanel.style` section
- `scripts/generate-defaults.mjs` -- verify PATH_TO_CONST coverage (no new constants needed since free* booleans default to false/undefined)

---

## Phase 8: Test Coverage & Quality Gates

**Goal:** Establish minimum test coverage for critical paths and add CI-ready quality scripts.

### 8.1 -- Add test for `borderUnion` extraction

After Phase 2, the extracted `computeUnionPath` and `computeBorderMaskRects` are pure functions and easy to test.

```ts
// src/utils/borderUnion.test.ts (new file)
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeUnionPath, computeBorderMaskRects } from "./borderUnion";
```

**Files created:**
- `src/utils/borderUnion.test.ts`

### 8.2 -- Add test for `deleteEntity` helper

```ts
// src/utils/deleteEntity.test.ts (new file)
```

**Files created:**
- `src/utils/deleteEntity.test.ts`

### 8.3 -- Add test for factory spread-safety

Verify `createTextBlock({ style: { fontSize: 42 } })` preserves other style defaults.

```ts
// src/utils/createProject.test.ts (new file)
```

**Files created:**
- `src/utils/createProject.test.ts`

### 8.4 -- Add `typecheck` and `test` scripts to `package.json`

```json
"scripts": {
  "typecheck": "tsc --noEmit",
  "test": "node --test src/**/*.test.ts",
  "check": "npm run lint && npm run typecheck && npm run test"
}
```

**Files modified:**
- `package.json` -- add scripts

---

## Phase 9: Barrel Export Cleanup & Dead Code Removal

**Goal:** Reduce import friction and remove stale code.

### 9.1 -- Audit all barrel `index.ts` files

Ensure every barrel only re-exports public APIs. Remove any re-exports of internal helpers.

**Files to audit:**
- `src/components/canvas/index.ts`
- `src/components/layout/index.ts`
- `src/components/layout/Editor/index.ts`
- `src/components/layout/Home/index.ts`
- `src/components/shared/UI/index.ts`

### 9.2 -- Remove `DebugAxis.tsx` from production

If `DebugAxis` is dev-only, gate it behind `process.env.NODE_ENV === "development"` or move to a `debug/` route.

**Files modified:**
- `src/components/debug/DebugAxis.tsx` -- add dev-only guard

### 9.3 -- Remove `@styles/*` path alias

The `@styles/*` alias maps to `src/styles/*` but is only used by `globals.css` which is imported via `@import` in CSS, not TS. If unused in TS, remove from `tsconfig.json`.

**Files modified:**
- `tsconfig.json` -- remove `@styles/*` if unused

---

## Execution Order

| Phase | Depends On | Risk | Estimated Files Changed |
|---|---|---|---|
| 1. Store Hygiene | None | Low | 5 |
| 2. Decompose `useWBorder` | Phase 1.2, 1.3 | Medium | 4 |
| 3. Portal Safety | None | Low | 4 |
| 4. Factory Safety | None | Low | 1 |
| 5. Keyboard Shortcuts | Phase 4 | Low | 2 |
| 6. CSS Cleanup | None | Low | 2-5 |
| 7. Type/Schema Alignment | None | Low | 3 |
| 8. Test Coverage | Phase 2, 4, 5 | Low | 3 new files + package.json |
| 9. Barrel Cleanup | All prior | Low | 6 |

---

## Post-Refactoring Verification

After all phases, run:

```bash
npm run check          # lint + typecheck + test
npm run build          # full production build
npm run dev            # manual smoke test: create project, add panels, text groups, undo/redo, image drop
```

Verify:
- [ ] No `document.getElementById` calls remain in component code
- [ ] `useWBorder` is under 100 lines
- [ ] `WPanel` and `WTextGroup` do not subscribe to `project` store directly
- [ ] All factory functions deep-merge style objects
- [ ] All tests pass
- [ ] Build succeeds with no type errors
