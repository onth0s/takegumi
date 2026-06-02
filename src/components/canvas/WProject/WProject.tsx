import type { WProject as WProjectType } from "@/types/canvas";
import WPanel from "../WPanel";

interface Props {
  project: WProjectType;
}

export default function WProject({ project }: Props) {
  return (
    <div className="w-4/5 bg-white h-full overflow-y-auto no-scrollbar flex flex-col gap-8 p-8">
      {project.panels.map((panel, i) => (
        <div key={panel.id} className={i % 2 === 0 ? "self-start" : "self-end"}>
          <WPanel panel={panel} />
        </div>
      ))}
    </div>
  );
}
