# Takegumi Architecture & System Design Reference

## Overview
Takegumi is a webtoon typesetting & content workstation.

## Architecture Layers
1. **Schema SSOT (`gnd/schemas/canvas.yaml`)**: Ground truth for data model & runtime defaults.
2. **Domain Persistence Store (`useProjectStore`)**: Manages WProject, WPanel, WTextGroup, and WTextBlock entities with IndexedDB storage via localForage.
3. **UI Ephemeral Store (`useUIStore`)**: Manages transient selection, guide lines, and textGroupRect cache.
4. **Synthetic Border Engine (`useWBorder` + `borderUnion.ts`)**: Generates dynamic border paths with speech bubble union subtraction.
5. **Compositing & Tail Engine (`useWPath` + `pathGenerators.ts`)**: Measures text offscreen and renders vector backdrops & speech tails.
