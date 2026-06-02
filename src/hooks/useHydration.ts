import { useState, useEffect } from "react";
import { useProjectStore } from "@/stores/projectStore";

export function useHydration() {
  const [hydrated, setHydrated] = useState(() => useProjectStore.persist.hasHydrated());

  useEffect(() => {
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
