"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";

export default function Footer() {
  const router = useRouter();

  const handleNuke = useCallback(async () => {
    // 1. Flush any pending continuous-commit timer
    useProjectStore.getState().clearHistory();
    // 2. Reset all in-memory state to factory defaults (including projects list)
    useProjectStore.setState({
      project: null,
      projects: [],
      past: [],
      future: [],
      tempPastState: null,
      continuousTimer: null,
      lastChangedElementId: null,
    });
    // 3. Wipe the IndexedDB project store entry
    useProjectStore.persist.clearStorage();
    // 4. Wipe the IndexedDB panel image binary store
    const { imageBlobStore } = await import("@/stores/imageStore");
    await imageBlobStore.clear();
    // 5. Back to home
    router.push("/");
  }, [router]);

  return (
    <div className="flex items-center justify-between w-full px-6 pb-5 pt-1">
      <button
        onClick={() => router.push("/workspace")}
        className="text-sm text-accent hover:text-accent-hover cursor-pointer transition-colors duration-150"
      >
        Load demo
      </button>

      <p className="text-xs text-text-tertiary tracking-wide">
        Built for stories that move.
      </p>

      <button
        id="nuke-storage-btn"
        onClick={handleNuke}
        className="text-sm uppercase text-danger hover:bg-danger hover:text-white px-3 py-1 -mx-3 -my-1 rounded cursor-pointer transition-colors duration-150"
      >
        Nuke &apos;em all
      </button>
    </div>
  );
}
