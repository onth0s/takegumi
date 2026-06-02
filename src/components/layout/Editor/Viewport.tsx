import { WProject } from "@/components/canvas";

export default function Viewport() {
  return (
    <div className="flex-1 h-full overflow-hidden bg-grid flex items-center justify-center">
      <WProject />
    </div>
  );
}
