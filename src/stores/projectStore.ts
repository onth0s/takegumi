import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce, produceWithPatches, applyPatches } from "immer";
import type { WProject, WProjectGrid } from "@/types/canvas";
import {
  DEFAULT_GRID_SIZE,
  DEFAULT_GRID_SNAP_ENABLED,
  DEFAULT_GRID_SHOW_GRID,
  DEFAULT_CANVAS_THEME,
  DEFAULT_PANEL_BORDER_ENABLED,
  DEFAULT_PANEL_BORDER_COLOR,
  DEFAULT_PANEL_BORDER_WIDTH,
  DEFAULT_PANEL_DISABLE_SYNTHETIC_BORDER,
} from "@/constants/canvasDefaults";
import { projectStoreDb } from "@/storage";
import {
  CONTINUOUS_COMMIT_DEBOUNCE_MS,
  emptyHistoryState,
  flushContinuousCommit,
  MAX_HISTORY_DEPTH,
  type CommitType,
  type HistoryState,
  type HistoryStep,
} from "@/stores/projectHistory";

import { clearAllPanelImages, deletePanelImage } from "@/utils/panelImageStorage";
import { syncProjectInList } from "@/utils/projectList";

interface PersistedProjectState {
  project: WProject | null;
  projects: WProject[];
}

export interface ProjectState extends HistoryState {
  project: WProject | null;
  projects: WProject[];

  /** Switch the active project and sync the recents list. Clears undo/redo history. */
  setProject: (project: WProject) => void;
  deleteProject: (projectId: string) => void;
  /** Mutate the active project. Records undo history unless commitType is `"ignore"`. */
  updateProject: (
    recipe: (draft: WProject) => void,
    commitType?: CommitType,
    elementId?: string
  ) => void;

  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  endContinuousCommit: () => void;

  /** Convenience getter — total text blocks across all panels. */
  getTotalTextBlockCount: () => number;

  /** Wipe all persisted project data, history, and panel image blobs. */
  resetAll: () => Promise<void>;
}

/** Fill in missing schema fields on projects loaded from a previous version. */
function migrateProject(project: WProject): WProject {
  const defaultGrid: WProjectGrid = {
    size: DEFAULT_GRID_SIZE,
    snapEnabled: DEFAULT_GRID_SNAP_ENABLED,
    showGrid: DEFAULT_GRID_SHOW_GRID,
  };
  const panels = (project.panels ?? []).map((panel, index) => ({
    ...panel,
    borderEnabled: panel.borderEnabled ?? DEFAULT_PANEL_BORDER_ENABLED,
    borderColor: panel.borderColor ?? DEFAULT_PANEL_BORDER_COLOR,
    borderWidth: panel.borderWidth ?? DEFAULT_PANEL_BORDER_WIDTH,
    disableSyntheticBorder: panel.disableSyntheticBorder ?? DEFAULT_PANEL_DISABLE_SYNTHETIC_BORDER,
    zIndex: panel.zIndex ?? index,
    textGroups: (panel.textGroups ?? []).map((tg) => ({
      ...tg,
      blocks: (tg.blocks ?? []).map((block) => ({
        ...block,
      })),
    })),
  }));
  return {
    ...project,
    grid: project.grid ?? defaultGrid,
    canvasTheme: (project as Partial<WProject>).canvasTheme ?? DEFAULT_CANVAS_THEME,
    disableSyntheticBorder: project.disableSyntheticBorder ?? false,
    panels,
  };
}

const indexedDBStorage = createJSONStorage<PersistedProjectState>(() => ({
  getItem: async (name) => projectStoreDb.getItem(name),
  setItem: async (name, value) => {
    await projectStoreDb.setItem(name, value);
  },
  removeItem: async (name) => {
    await projectStoreDb.removeItem(name);
  },
}));

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      project: null,
      projects: [],
      ...emptyHistoryState(),

      setProject: (project) => {
        set((state) => {
          const flushed = flushContinuousCommit(state);
          return {
            ...flushed,
            project,
            projects: syncProjectInList(state.projects || [], project),
            past: [],
            future: [],
          };
        });

      },

      deleteProject: (projectId) => {

        set((state) => {
          const flushed = flushContinuousCommit(state);
          const currentProjects = state.projects || [];
          const nextProjects = currentProjects.filter((p) => p.id !== projectId);
          const activeProjectDeleted = state.project?.id === projectId;

          const deletedProj = currentProjects.find((p) => p.id === projectId);
          if (deletedProj) {
            deletedProj.panels.forEach((panel) => {
              deletePanelImage(panel.id).catch((err) => {
                console.error("Failed to delete image for panel", panel.id, err);
              });
            });
          }

          return {
            ...flushed,
            projects: nextProjects,
            project: activeProjectDeleted ? null : state.project,
            past: activeProjectDeleted ? [] : flushed.past,
            future: activeProjectDeleted ? [] : flushed.future,
          };
        });

      },

      updateProject: (recipe, commitType = "discrete", elementId) => {
        const state = get();
        if (!state.project) return;

        if (commitType === "ignore") {
          const nextProject = produce(state.project, (draft) => {
            recipe(draft);
            draft.updatedAt = new Date().toISOString();
          });
          const nextProjects = syncProjectInList(state.projects || [], nextProject);
          set({ project: nextProject, projects: nextProjects });
          return;
        }

        if (commitType === "discrete") {
          const [nextProject, patches, inversePatches] = produceWithPatches(state.project, (draft) => {
            recipe(draft);
            draft.updatedAt = new Date().toISOString();
          });
          const nextProjects = syncProjectInList(state.projects || [], nextProject);

          set((curr) => {
            const flushed = flushContinuousCommit(curr);
            const step: HistoryStep = { patches, inversePatches };
            const newPast = [...flushed.past, step].slice(-MAX_HISTORY_DEPTH);
            return {
              ...flushed,
              project: nextProject,
              projects: nextProjects,
              past: newPast,
              future: [],
            };
          });
          return;
        }

        if (commitType === "continuous") {
          const nextProject = produce(state.project, (draft) => {
            recipe(draft);
            draft.updatedAt = new Date().toISOString();
          });
          const nextProjects = syncProjectInList(state.projects || [], nextProject);

          set((curr) => {
            const isNewSession =
              !curr.tempPastState ||
              (elementId != null && curr.lastChangedElementId !== elementId);

            let savedBaseState = curr.tempPastState;
            let nextPast = curr.past;
            let nextFuture = curr.future;

            if (isNewSession) {
              // Commit the previous session's base state (element switch mid-drag)
              if (savedBaseState && curr.project) {
                const [, patches, inversePatches] = produceWithPatches(savedBaseState, () => curr.project!);
                const step: HistoryStep = { patches, inversePatches };
                nextPast = [...curr.past, step].slice(-MAX_HISTORY_DEPTH);
              }
              savedBaseState = curr.project;
              // Starting a fresh edit — invalidate the redo stack
              nextFuture = [];
            }

            if (curr.continuousTimer) {
              clearTimeout(curr.continuousTimer);
            }

            const timer = setTimeout(() => {
              get().endContinuousCommit();
            }, CONTINUOUS_COMMIT_DEBOUNCE_MS);

            return {
              project: nextProject,
              projects: nextProjects,
              past: nextPast,
              future: nextFuture,
              tempPastState: savedBaseState,
              continuousTimer: timer,
              lastChangedElementId: elementId ?? null,
            };
          });
        }
      },

      endContinuousCommit: () => {
        set((curr) => {
          if (curr.continuousTimer) {
            clearTimeout(curr.continuousTimer);
          }
          if (curr.tempPastState && curr.project) {
            const [, patches, inversePatches] = produceWithPatches(curr.tempPastState, () => curr.project!);
            const step: HistoryStep = { patches, inversePatches };
            const newPast = [...curr.past, step].slice(-MAX_HISTORY_DEPTH);
            return {
              past: newPast,
              future: [],
              tempPastState: null,
              continuousTimer: null,
              lastChangedElementId: null,
            };
          }
          return {
            continuousTimer: null,
            tempPastState: null,
            lastChangedElementId: null,
          };
        });
      },

      undo: () => {
        set((curr) => {
          const flushed = flushContinuousCommit(curr);
          const activePast = flushed.past;

          if (activePast.length === 0 || !curr.project) return {};

          const stepToUndo = activePast[activePast.length - 1];
          const remainingPast = activePast.slice(0, -1);

          const previousProject = applyPatches(curr.project, stepToUndo.inversePatches);
          const newFuture = [stepToUndo, ...curr.future].slice(0, MAX_HISTORY_DEPTH);

          return {
            ...flushed,
            project: previousProject,
            projects: syncProjectInList(curr.projects || [], previousProject),
            past: remainingPast,
            future: newFuture,
          };
        });
      },

      redo: () => {
        set((curr) => {
          const flushed = flushContinuousCommit(curr);
          if (curr.future.length === 0 || !curr.project) return {};

          const stepToRedo = curr.future[0];
          const remainingFuture = curr.future.slice(1);
          const newPast = [...flushed.past, stepToRedo].slice(-MAX_HISTORY_DEPTH);

          const nextProject = applyPatches(curr.project, stepToRedo.patches);

          return {
            ...flushed,
            project: nextProject,
            projects: syncProjectInList(curr.projects || [], nextProject),
            past: newPast,
            future: remainingFuture,
          };
        });
      },

      clearHistory: () => {
        set((curr) => {
          if (curr.continuousTimer) {
            clearTimeout(curr.continuousTimer);
          }
          return emptyHistoryState();
        });
      },

      getTotalTextBlockCount: () => {
        const project = get().project;
        if (!project) return 0;
        return project.panels.reduce(
          (sum, p) => sum + p.textGroups.reduce(
            (gs, g) => gs + g.blocks.length, 0
          ), 0
        );
      },

      resetAll: async () => {
        get().clearHistory();
        set({
          project: null,
          projects: [],
          ...emptyHistoryState(),
        });

        await useProjectStore.persist.clearStorage();
        await clearAllPanelImages();
      },
    }),
    {
      name: "takegumi-project-storage",
      storage: indexedDBStorage,
      partialize: (state): PersistedProjectState => ({
        project: state.project,
        projects: state.projects || [],
      }),
      merge: (persisted, current) => {
        const p = persisted as PersistedProjectState | undefined;
        if (!p?.project) return { ...current, ...p };

        return {
          ...current,
          ...p,
          project: migrateProject(p.project),
          projects: (p.projects ?? []).map(migrateProject),
        };
      },
    }
  )
);

export const selectPanelCount = (s: ProjectState) => s.project?.panels.length ?? 0;
export const selectGroupCount = (s: ProjectState) =>
  s.project?.panels.reduce((sum, p) => sum + p.textGroups.length, 0) ?? 0;
export const selectBlockCount = (s: ProjectState) =>
  s.project?.panels.reduce(
    (sum, p) => sum + p.textGroups.reduce((gs, g) => gs + g.blocks.length, 0),
    0
  ) ?? 0;
