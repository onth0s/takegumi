import { useProjectStore } from "./projectStore";
import { useUIStore } from "./uiStore";

let isSynced = false;

export function initStoreSync() {
  if (isSynced) return () => {};
  isSynced = true;

  let lastUpdatedAt = useProjectStore.getState().project?.updatedAt;
  let lastProjectId = useProjectStore.getState().project?.id;

  const unsubscribe = useProjectStore.subscribe((state) => {
    const currentProject = state.project;
    const currentProjectId = currentProject?.id;
    const currentUpdatedAt = currentProject?.updatedAt;

    if (!currentProject) {
      useUIStore.getState().resetRevision();
      lastUpdatedAt = undefined;
      lastProjectId = undefined;
      return;
    }

    if (currentProjectId !== lastProjectId) {
      useUIStore.getState().resetRevision();
      lastProjectId = currentProjectId;
      lastUpdatedAt = currentUpdatedAt;
      return;
    }

    if (currentUpdatedAt !== lastUpdatedAt) {
      lastUpdatedAt = currentUpdatedAt;
      useUIStore.getState().incrementRevision();
    }
  });

  return () => {
    unsubscribe();
    isSynced = false;
  };
}
