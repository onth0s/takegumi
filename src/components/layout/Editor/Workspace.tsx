"use client";

import StatusBar from "./StatusBar";
import Viewport from "./Viewport";
import Inspector from "./Inspector";
import FloatingHeader from "./FloatingHeader";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { initStoreSync } from "@/stores/storeSync";

export default function Workspace() {
  initStoreSync();
  useKeyboardShortcuts();

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden relative">
      <FloatingHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Viewport />
        <Inspector />
      </div>
      <StatusBar />
    </div>
  );
}
