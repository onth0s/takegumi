import type { WPanel } from "@/types/canvas";

/** Ensure all panels have clean, unique, sequential zIndices starting from 0. */
export function normalizeZIndices(panels: WPanel[]): void {
  const sorted = [...panels].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  sorted.forEach((p, idx) => {
    p.zIndex = idx;
  });
}

export function bringToFront(panels: WPanel[], targetId: string): void {
  normalizeZIndices(panels);
  const target = panels.find((p) => p.id === targetId);
  if (!target) return;
  const sorted = [...panels].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const remaining = sorted.filter((p) => p.id !== targetId);
  remaining.forEach((p, idx) => {
    p.zIndex = idx;
  });
  target.zIndex = remaining.length;
}

export function sendToBack(panels: WPanel[], targetId: string): void {
  normalizeZIndices(panels);
  const target = panels.find((p) => p.id === targetId);
  if (!target) return;
  const sorted = [...panels].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const remaining = sorted.filter((p) => p.id !== targetId);
  remaining.forEach((p, idx) => {
    p.zIndex = idx + 1;
  });
  target.zIndex = 0;
}

export function bringForward(panels: WPanel[], targetId: string): void {
  normalizeZIndices(panels);
  const target = panels.find((p) => p.id === targetId);
  if (!target) return;
  const sorted = [...panels].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const currentIndex = sorted.findIndex((p) => p.id === targetId);
  if (currentIndex < sorted.length - 1) {
    const nextPanel = sorted[currentIndex + 1];
    const temp = target.zIndex;
    target.zIndex = nextPanel.zIndex;
    nextPanel.zIndex = temp;
  }
}

export function sendBackward(panels: WPanel[], targetId: string): void {
  normalizeZIndices(panels);
  const target = panels.find((p) => p.id === targetId);
  if (!target) return;
  const sorted = [...panels].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const currentIndex = sorted.findIndex((p) => p.id === targetId);
  if (currentIndex > 0) {
    const prevPanel = sorted[currentIndex - 1];
    const temp = target.zIndex;
    target.zIndex = prevPanel.zIndex;
    prevPanel.zIndex = temp;
  }
}
