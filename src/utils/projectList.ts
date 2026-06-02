import type { WProject } from "@/types/canvas";

/** Upserts the active project into the recents list by id. */
export function syncProjectInList(projects: WProject[], updated: WProject): WProject[] {
  const exists = projects.some((p) => p.id === updated.id);
  return exists
    ? projects.map((p) => (p.id === updated.id ? updated : p))
    : [...projects, updated];
}
