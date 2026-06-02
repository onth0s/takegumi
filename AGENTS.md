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