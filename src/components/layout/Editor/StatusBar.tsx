"use client";

import { useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { Tooltip } from "@/components/shared/UI";
import InlineProjectName from "./InlineProjectName";

export default function StatusBar() {
  const project = useProjectStore((s) => s.project);
  const updateProject = useProjectStore((s) => s.updateProject);
  const past = useProjectStore((s) => s.past);
  const future = useProjectStore((s) => s.future);
  const revision = useUIStore((s) => s.revision);
  const selectedPanelId = useUIStore((s) => s.selectedWPanelId);
  const selectedGroupId = useUIStore((s) => s.selectedWTextGroupId);
  const selectedBlockId = useUIStore((s) => s.selectedWTextBlockId);
  const selectPanel = useUIStore((s) => s.selectPanel);
  const selectTextGroup = useUIStore((s) => s.selectTextGroup);
  const selectTextBlock = useUIStore((s) => s.selectTextBlock);

  const handleRename = useCallback(
    (name: string) => {
      updateProject((draft) => {
        draft.name = name;
      }, "discrete");
    },
    [updateProject]
  );

  if (!project) return null;

  const panelCount = project.panels.length;
  const groupCount = project.panels.reduce((sum, p) => sum + p.textGroups.length, 0);
  const blockCount = project.panels.reduce(
    (sum, p) => sum + p.textGroups.reduce((gs, g) => gs + g.blocks.length, 0), 0
  );
  const isDirty = revision > 0;
  const undoDepth = past.length;
  const redoDepth = future.length;

  const selectedPanel = selectedPanelId
    ? project.panels.find((p) => p.id === selectedPanelId) ?? null
    : null;
  const selectedGroup =
    selectedPanel && selectedGroupId
      ? selectedPanel.textGroups.find((g) => g.id === selectedGroupId) ?? null
      : null;
  const selectedBlock =
    selectedGroup && selectedBlockId
      ? selectedGroup.blocks.find((b) => b.id === selectedBlockId) ?? null
      : null;

  return (
    <div className="flex items-center h-12 gap-4 px-4 text-xs text-text-secondary border-t border-accent bg-surface-elevated select-none">
      {/* ── Left zone: project context ── */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full border border-border-default shrink-0 ${
            project.canvasTheme === "dark" ? "bg-black" : "bg-white"
          }`}
        />
        <span className="text-sm text-text-primary font-medium truncate">
          <InlineProjectName name={project.name} onRename={handleRename} />
        </span>
        <Tooltip content={isDirty ? `${revision} modification${revision !== 1 ? "s" : ""}` : "No unsaved changes"}>
          <span className={`transition-colors duration-200 ${isDirty ? "text-accent" : "text-border-default"}`}>
            ●
          </span>
        </Tooltip>
        <Tooltip content={`${panelCount} panel${panelCount !== 1 ? "s" : ""} · ${groupCount} group${groupCount !== 1 ? "s" : ""} · ${blockCount} block${blockCount !== 1 ? "s" : ""}`}>
          <span className="hidden md:inline text-text-tertiary">
            {panelCount}p · {groupCount}g · {blockCount}b
          </span>
        </Tooltip>
      </div>

      {/* ── Center zone: selection breadcrumb ── */}
      <div className="flex items-center gap-1.5 min-w-0">
        {!selectedPanel && (
          <span className="text-text-tertiary">No selection</span>
        )}
        {selectedPanel && (
          <>
            <button
              type="button"
              onClick={() => selectPanel(selectedPanel.id)}
              className="hover:text-text-primary transition-colors truncate"
              title={`Panel ${selectedPanel.id.slice(0, 6)} [${selectedPanel.width}×${selectedPanel.height}]`}
            >
              Panel [{selectedPanel.width}×{selectedPanel.height}]
            </button>
            {selectedGroup && (
              <>
                <span className="opacity-30">›</span>
                <button
                  type="button"
                  onClick={() => selectTextGroup(selectedPanel.id, selectedGroup.id)}
                  className="hover:text-text-primary transition-colors truncate"
                  title={`Group ${selectedGroup.id.slice(0, 6)}`}
                >
                  Group
                </button>
                {selectedBlock && (
                  <>
                <span className="text-text-tertiary">›</span>
                    <button
                      type="button"
                      onClick={() =>
                        selectTextBlock(selectedPanel.id, selectedGroup.id, selectedBlock.id)
                      }
                      className="hover:text-text-primary transition-colors truncate"
                      title={`Block: ${selectedBlock.text.slice(0, 40)}`}
                    >
                      Block
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── Right zone: dock ── */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {undoDepth > 0 && (
          <span className="text-text-tertiary" title="Undo history depth">
            Undo ({undoDepth})
          </span>
        )}
        {redoDepth > 0 && (
          <span className="text-text-tertiary" title="Redo history depth">
            Redo ({redoDepth})
          </span>
        )}
      </div>
    </div>
  );
}
