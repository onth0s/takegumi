import StatusBar from "./StatusBar";
import Viewport from "./Viewport";
import Inspector from "./Inspector";
import FloatingHeader from "./FloatingHeader";

export default function Workspace() {
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
