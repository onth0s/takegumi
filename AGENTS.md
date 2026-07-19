<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# USER RULES

## Regarding TailwindCSS Styling

- Whenever a class name has an underscore at the end "bg-blue-200_", it is just for debugging convenience, to quickly "switch" it on and off at will. Feel free to remove them whenever you see them. 

- Whenever you find a non-standard Tailwind spacing utility (mt-26 instead of mt-24 or mt-28) replace it with a standard one. I leave at your design judgment which one to choose instead.

## Theme colors and VS Code color decorators

- Keep hex/rgba values in `:root { }` blocks using `--_<name>` prefixed variables, then reference them in `@theme { }` via `var(--_<name>)`. This is because VS Code's CSS language server doesn't reliably maintain color swatches for hex values inside `@theme` blocks (they flash then vanish), but recognizes them permanently on `:root`.
- Both blocks must be kept in sync — the `@theme` block drives Tailwind utility generation (`bg-surface`, `text-surface`, etc.), while `:root` provides the raw color values. 

## Surgical Edits — Never Reconstruct From Memory

- **Always read the file immediately before editing it.** Never reconstruct file content from conversation history or prior tool outputs — those may be stale.
- **Target the minimum lines necessary.** Only replace the exact lines that need to change. Do not re-emit surrounding content unless it is part of the contiguous block being changed.
- **Never infer "original" content.** If uncertain about the current state of a file, read it first, then edit. No exceptions.

## Schema Alignment Audit Rule

- **Perform Schema Audit on Changes:** Always audit and align the YAML schema file under `gnd/schemas/canvas.yaml` after every major data model change or new feature implementation to ensure it remains the single source of truth for the codebase and README specifications.

## Font Metadata Validation Rule

- **Check Font File Metadata:** When registering custom local font files (e.g. `.otf` or `.ttf`), always check the font files' internal metadata (such as PostScript name or Font Family name) to verify the exact font family name required by the browser, rather than assuming or guessing based on the filename.