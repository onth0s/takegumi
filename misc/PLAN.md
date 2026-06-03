# Takegumi — Refactoring Strategy

> **Audit date:** 2026-06-03
> **Codebase health:** 6.5/10 — clean foundations, needs tests, some dead code, stale README, accessibility gaps.

---

## Phase 1 — Cleanup & Dead Code Removal

- Remove unused exports: `ClosestGridLine`, `isWithinThreshold`, `getClosestGridLine` (`src/utils/snapMath.ts`)
- Remove unused export: `findPanelIdForGroup` (`src/utils/findInProject.ts`)
- Delete deprecated `src/stores/imageStore.ts` (nothing imports from it)
- Fix dead `motion` animation in `DeleteConfirmChip.tsx` (`initial={false}` makes `animate` a no-op) — replace with CSS
- Replace `motion` fade-in in `WPanel.tsx` with plain CSS `@keyframes`

## Phase 2 — Error Handling & Robustness

- Add `.catch()` to unhandled `Promise.all` in `processImageFiles.ts` (callers: `Center.tsx`, `WProject.tsx`)
- Skip `finalizePanel` on image load error to prevent broken-image blob persistence
- Add `role="button"`, `aria-label`, `tabIndex` to back button in `FloatingHeader.tsx`
- Fix `alt` text on SVG icons: `"✓"`/`"✗"` → descriptive text, `"X"` → `"Delete project"`

## Phase 3 — Code Quality & DRY

- Extract shared `useElementDimensions` hook from duplicated `ResizeObserver` logic in `useWPath.ts` and `WTextBlock.tsx`
- Add `htmlFor`/`id` label-input associations in `InspectorFields.tsx`
- Add `aria-labelledby` to `<button role="switch">` in `InspectorToggle`

## Phase 4 — Performance & SSR

- Remove `"use client"` from server-compatible components (e.g., `Home`, `Footer`, `Header`, `layout.tsx`)
- Memoize inspector content to reduce re-renders on selection changes

## Phase 5 — Accessibility Pass

- Systematic review of all interactive elements for missing ARIA attributes
- Ensure all form inputs have associated `<label>`
- Ensure all icon-only buttons have descriptive `aria-label`

## Phase 6 — YAML-Driven Code Generation

- Create `scripts/generate-defaults.mjs` that reads `gnd/schemas/canvas.yaml`
- Extract property defaults and regenerate `src/constants/canvasDefaults.ts` at build time
- Optionally generate `src/types/canvas.ts` type definitions from the same YAML source
- Wire into `next dev` / `next build` via `predev` / `prebuild` scripts in `package.json`
