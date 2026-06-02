"use client";

import type { WProject } from "@/types/canvas";
import ProjectDeleteControl from "./ProjectDeleteControl";
import ProjectThumbnail from "./ProjectThumbnail";
import { panelCountLabel } from "./panelCountLabel";

interface Props {
  project: WProject;
  thumbnailSrc: string | null;
  onSelect: () => void;
  confirmingDeleteId: string | null;
  setConfirmingDeleteId: (id: string | null) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({
  project,
  thumbnailSrc,
  onSelect,
  confirmingDeleteId,
  setConfirmingDeleteId,
  onDelete,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className="group flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-surface-hover hover:bg-accent/5 transition-colors duration-150 cursor-pointer border border-transparent hover:border-accent/10 text-center"
    >
      <div
        className="relative w-28 h-28 shrink-0"
        onMouseLeave={() => {
          if (confirmingDeleteId === project.id) {
            setConfirmingDeleteId(null);
          }
        }}
      >
        <ProjectThumbnail thumbnailSrc={thumbnailSrc} variant="grid" />
        <ProjectDeleteControl
          projectId={project.id}
          confirmingDeleteId={confirmingDeleteId}
          setConfirmingDeleteId={setConfirmingDeleteId}
          onDelete={onDelete}
          overlayClassName="-top-1 -right-1"
          buttonClassName="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-surface-elevated hover:bg-border-default rounded-full transition-all duration-150 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-10 hover:scale-105"
        />
      </div>
      <div className="min-w-0 w-full">
        <p className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 truncate">
          {project.name}
        </p>
        <p className="text-[10px] text-text-tertiary truncate">
          {panelCountLabel(project.panels.length)}
        </p>
      </div>
    </div>
  );
}
