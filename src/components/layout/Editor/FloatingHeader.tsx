"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export default function FloatingHeader() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="absolute top-6 left-4 z-10 select-none flex items-center gap-2">
      <button
        type="button"
        aria-label="Back to home"
        className="bg-black/70 flex w-10 h-10 justify-center items-center text-text-secondary rounded-sm border border-accent cursor-pointer hover:text-accent transition-colors duration-150"
        onClick={handleBack}
      >
        <span aria-hidden="true">←</span>
      </button>
    </div>
  );
}
