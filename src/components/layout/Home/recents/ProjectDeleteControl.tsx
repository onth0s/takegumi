"use client";

import DeleteConfirmChip from "./DeleteConfirmChip";

interface Props {
  projectId: string;
  confirmingDeleteId: string | null;
  setConfirmingDeleteId: (id: string | null) => void;
  onDelete: (id: string) => void;
  overlayClassName: string;
  buttonClassName: string;
}

export default function ProjectDeleteControl({
  projectId,
  confirmingDeleteId,
  setConfirmingDeleteId,
  onDelete,
  overlayClassName,
  buttonClassName,
}: Props) {
  if (confirmingDeleteId === projectId) {
    return (
      <DeleteConfirmChip
        onConfirm={(e) => {
          e.stopPropagation();
          onDelete(projectId);
        }}
        onCancel={(e) => {
          e.stopPropagation();
          setConfirmingDeleteId(null);
        }}
        className={overlayClassName}
      />
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setConfirmingDeleteId(projectId);
      }}
      className={buttonClassName}
      title="Delete project"
    >
      <img src="/SVG/delete.svg" className="w-2.5 h-2.5" alt="X" />
    </button>
  );
}
