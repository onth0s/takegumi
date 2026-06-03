import { useSyncExternalStore } from "react";
import { useProjectStore } from "@/stores/projectStore";

export function useHydration() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const unsubHydrate = useProjectStore.persist.onHydrate(onStoreChange);
      const unsubFinish = useProjectStore.persist.onFinishHydration(onStoreChange);
      return () => {
        unsubHydrate();
        unsubFinish();
      };
    },
    () => useProjectStore.persist.hasHydrated(),
    () => false,
  );
}
