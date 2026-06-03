"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";

function HeaderButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex w-10 h-10 justify-center items-center text-text-secondary rounded-sm border border-accent bg-black/70 hover:border-accent/50 hover:text-accent transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-accent disabled:hover:text-text-secondary"
    >
      {label === "Undo" ? "↶" : label === "Redo" ? "↷" : label}
    </button>
  );
}

export default function FloatingHeader() {
  const router = useRouter();
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const canUndo = useProjectStore((s) => s.past.length > 0 || s.tempPastState !== null);
  const canRedo = useProjectStore((s) => s.future.length > 0);

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <>
      <div className="absolute top-6 left-4 z-10 select-none flex items-center gap-2">
        <div
          className="bg-black/70 flex w-10 h-10 justify-center items-center text-text-secondary rounded-sm border border-accent cursor-pointer hover:text-accent transition-colors duration-150"
          onClick={handleBack}
        >
          <span aria-hidden="true">←</span>
        </div>
      </div>
      <div className="absolute bottom-14 left-4 z-10 select-none flex items-center gap-2">
        <HeaderButton label="Undo" disabled={!canUndo} onClick={undo} />
        <HeaderButton label="Redo" disabled={!canRedo} onClick={redo} />
      </div>
    </>
  );
}
