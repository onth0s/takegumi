import { useState, useEffect } from "react";
import { useProjectStore } from "../stores/projectStore";

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if store has already hydrated on mount
    if (useProjectStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    // Subscribe to hydration events
    const unsubHydrate = useProjectStore.persist.onHydrate(() => {
      setHydrated(false);
    });

    const unsubFinish = useProjectStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => {
      unsubHydrate();
      unsubFinish();
    };
  }, []);

  return hydrated;
}
export default useHydration;
