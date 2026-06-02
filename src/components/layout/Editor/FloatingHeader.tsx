"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export default function FloatingHeader() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="absolute top-6 left-4 z-10 select-none">
      <div
        className="bg-black/70 flex w-10 h-10 justify-center items-center text-text-secondary rounded-sm border-accent border cursor-pointer"
        onClick={handleBack}
      >
        <p>&#8592;</p>
      </div>
    </div>
  );
}
