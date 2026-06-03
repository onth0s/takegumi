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

export default function ProjectRow({
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
      onMouseLeave={() => {
        if (confirmingDeleteId === project.id) {
          setConfirmingDeleteId(null);
        }
      }}
      className="group relative w-full text-left rounded-lg hover:bg-surface-hover hover:bg-accent/5 transition-colors duration-150 cursor-pointer border border-transparent hover:border-accent/10"
    >
      <div className="flex items-center gap-3 px-3 h-14">
        <div className="relative min-w-0 self-stretch aspect-square shrink-0">
          <ProjectThumbnail thumbnailSrc={thumbnailSrc} variant="list" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors duration-150 truncate">
            {project.name}
          </p>
          <p className="text-xs text-text-tertiary truncate">
            {panelCountLabel(project.panels.length)}
          </p>
        </div>
      </div>

      <ProjectDeleteControl
        projectId={project.id}
        confirmingDeleteId={confirmingDeleteId}
        setConfirmingDeleteId={setConfirmingDeleteId}
        onDelete={onDelete}
        overlayClassName="top-1.5 right-1.5"
        buttonClassName="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center bg-surface-elevated hover:bg-border-default rounded-full transition-all duration-150 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-10 hover:scale-105"
      />
    </div>
  );
}
