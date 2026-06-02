/** Thin wrapper around crypto.randomUUID — available in all modern browsers and Node ≥19. */
export function uid(): string {
  return crypto.randomUUID();
}
