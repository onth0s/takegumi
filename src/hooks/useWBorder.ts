import { useState, useLayoutEffect, RefObject } from "react";
import type { WPanel } from "@/types/canvas";
import { useUIStore } from "@/stores/uiStore";

interface UseWBorderProps {
  panel: WPanel;
  panelRef: RefObject<HTMLElement | null>;
  disableSyntheticBorderGlobal?: boolean;
}

interface UseWBorderResult {
  pathD: string;
  borderColor: string;
  borderWidth: number;
  enabled: boolean;
}

function mergeIntervals(intervals: [number, number][]): [number, number][] {
  if (intervals.length === 0) return [];
  // Sort by start position
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const curr = sorted[i];
    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}

export function useWBorder({
  panel,
  panelRef,
  disableSyntheticBorderGlobal = false,
}: UseWBorderProps): UseWBorderResult {
  const [pathD, setPathD] = useState("");
  const revision = useUIStore((s) => s.revision);
  const hideAllText = useUIStore((s) => s.hideAllText);

  const enabled =
    !!panel.borderEnabled &&
    !panel.disableSyntheticBorder &&
    !disableSyntheticBorderGlobal;

  const borderWidth = panel.borderWidth ?? 4;
  const borderColor = panel.borderColor ?? "#000000";

  useLayoutEffect(() => {
    if (!enabled || !panelRef.current) {
      setPathD("");
      return;
    }

    const computePath = () => {
      const panelEl = panelRef.current;
      if (!panelEl) return;

      const panelRect = panelEl.getBoundingClientRect();
      const pWidth = Math.round(panelRect.width);
      const pHeight = Math.round(panelRect.height);
      const bw = borderWidth;

      // Define standard borders.
      // Top edge: [0, pWidth] at y = bw/2
      // Bottom edge: [0, pWidth] at y = pHeight - bw/2
      // Left edge: [bw, pHeight - bw] at x = bw/2 (preventing corner overlaps)
      // Right edge: [bw, pHeight - bw] at x = pWidth - bw/2

      const topGaps: [number, number][] = [];
      const bottomGaps: [number, number][] = [];
      const leftGaps: [number, number][] = [];
      const rightGaps: [number, number][] = [];

      if (!hideAllText) {
        panel.textGroups.forEach((group) => {
          const groupEl = document.getElementById(`text-group-${group.id}`);
          if (!groupEl) return;

          const groupRect = groupEl.getBoundingClientRect();
          const gLeft = Math.round(groupRect.left - panelRect.left);
          const gRight = Math.round(groupRect.right - panelRect.left);
          const gTop = Math.round(groupRect.top - panelRect.top);
          const gBottom = Math.round(groupRect.bottom - panelRect.top);

          // Top edge intersection (y range: 0 to bw)
          if (gBottom >= 0 && gTop <= bw) {
            topGaps.push([gLeft, gRight]);
          }
          // Bottom edge intersection (y range: pHeight - bw to pHeight)
          if (gBottom >= pHeight - bw && gTop <= pHeight) {
            bottomGaps.push([gLeft, gRight]);
          }
          // Left edge intersection (x range: 0 to bw)
          if (gRight >= 0 && gLeft <= bw) {
            leftGaps.push([gTop, gBottom]);
          }
          // Right edge intersection (x range: pWidth - bw to pWidth)
          if (gRight >= pWidth - bw && gLeft <= pWidth) {
            rightGaps.push([gTop, gBottom]);
          }
        });
      }

      const mergedTop = mergeIntervals(topGaps);
      const mergedBottom = mergeIntervals(bottomGaps);
      const mergedLeft = mergeIntervals(leftGaps);
      const mergedRight = mergeIntervals(rightGaps);

      let d = "";

      // Generate Top path
      let cursor = 0;
      mergedTop.forEach(([start, end]) => {
        const gapStart = Math.max(0, Math.min(pWidth, start));
        const gapEnd = Math.max(0, Math.min(pWidth, end));
        if (gapStart > cursor) {
          d += ` M ${cursor},${bw / 2} L ${gapStart},${bw / 2}`;
        }
        cursor = Math.max(cursor, gapEnd);
      });
      if (cursor < pWidth) {
        d += ` M ${cursor},${bw / 2} L ${pWidth},${bw / 2}`;
      }

      // Generate Bottom path
      cursor = 0;
      mergedBottom.forEach(([start, end]) => {
        const gapStart = Math.max(0, Math.min(pWidth, start));
        const gapEnd = Math.max(0, Math.min(pWidth, end));
        if (gapStart > cursor) {
          d += ` M ${cursor},${pHeight - bw / 2} L ${gapStart},${pHeight - bw / 2}`;
        }
        cursor = Math.max(cursor, gapEnd);
      });
      if (cursor < pWidth) {
        d += ` M ${cursor},${pHeight - bw / 2} L ${pWidth},${pHeight - bw / 2}`;
      }

      // Generate Left path (range: bw to pHeight - bw)
      cursor = bw;
      mergedLeft.forEach(([start, end]) => {
        const gapStart = Math.max(bw, Math.min(pHeight - bw, start));
        const gapEnd = Math.max(bw, Math.min(pHeight - bw, end));
        if (gapStart > cursor) {
          d += ` M ${bw / 2},${cursor} L ${bw / 2},${gapStart}`;
        }
        cursor = Math.max(cursor, gapEnd);
      });
      if (cursor < pHeight - bw) {
        d += ` M ${bw / 2},${cursor} L ${bw / 2},${pHeight - bw}`;
      }

      // Generate Right path (range: bw to pHeight - bw)
      cursor = bw;
      mergedRight.forEach(([start, end]) => {
        const gapStart = Math.max(bw, Math.min(pHeight - bw, start));
        const gapEnd = Math.max(bw, Math.min(pHeight - bw, end));
        if (gapStart > cursor) {
          d += ` M ${pWidth - bw / 2},${cursor} L ${pWidth - bw / 2},${gapStart}`;
        }
        cursor = Math.max(cursor, gapEnd);
      });
      if (cursor < pHeight - bw) {
        d += ` M ${pWidth - bw / 2},${cursor} L ${pWidth - bw / 2},${pHeight - bw}`;
      }

      setPathD(d.trim());
    };

    computePath();

    // Trigger update on resize as well
    window.addEventListener("resize", computePath);
    return () => {
      window.removeEventListener("resize", computePath);
    };
  }, [enabled, panel, borderWidth, borderColor, revision, hideAllText, panelRef]);

  return {
    pathD,
    borderColor,
    borderWidth,
    enabled,
  };
}
