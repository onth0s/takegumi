import StatusBar from "./StatusBar";
import Viewport from "./Viewport";
import Inspector from "./Inspector";
import FloatingHeader from "./FloatingHeader";

export default function Workspace() {
  return (
    <div className="flex flex-1 flex-col h-full w-full bg-background text-foreground overflow-hidden relative">
      <FloatingHeader />
      <div className="flex flex-1 min-h-0">
        <Viewport />
        <Inspector />
      </div>
      <StatusBar />
    </div>
  );
}
