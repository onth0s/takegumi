"use client";

import { useCallback } from "react";
import type { WProject } from "@/types/canvas";
import { useProjectStore } from "@/stores/projectStore";
import { FieldRow, InspectorInput, InspectorSection } from "./InspectorFields";

interface Props {
  project: WProject;
}

export default function ProjectInspector({ project }: Props) {
  const updateProject = useProjectStore((s) => s.updateProject);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateProject((draft) => {
        draft.name = e.target.value;
      }, "continuous");
    },
    [updateProject]
  );

  return (
    <div className="flex flex-col gap-6">
      <InspectorSection title="Project">
        <FieldRow label="Name">
          <InspectorInput
            type="text"
            value={project.name}
            onChange={handleNameChange}
            onBlur={() => useProjectStore.getState().endContinuousCommit()}
          />
        </FieldRow>
      </InspectorSection>
    </div>
  );
}
