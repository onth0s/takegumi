export function panelCountLabel(count: number): string {
  return `${count} ${count === 1 ? "panel" : "panels"}`;
}
