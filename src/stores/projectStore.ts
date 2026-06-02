import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";
import localforage from "localforage";
import { WProject, WPanel, WTextGroup, WTextBlock } from "../types/canvas";

// Configure localforage for IndexedDB storage
localforage.config({
  name: "Takegumi",
  storeName: "project_store",
});

const indexedDBStorage = createJSONStorage<ProjectState>(() => ({
  getItem: async (name) => {
    return await localforage.getItem(name);
  },
  setItem: async (name, value) => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name) => {
    await localforage.removeItem(name);
  },
}));

const MAX_HISTORY_DEPTH = 50;

interface ProjectState {
  project: WProject | null;
  
  // History Stacks
  past: WProject[];
  future: WProject[];
  
  // Temporal tracking for continuous actions
  tempPastState: WProject | null;
  continuousTimer: NodeJS.Timeout | null;
  lastChangedElementId: string | null;

  // Setters & Root Actions
  setProject: (project: WProject) => void;
  updateProject: (recipe: (draft: WProject) => void, commitType?: "discrete" | "continuous" | "ignore", elementId?: string) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Explicitly end a continuous sequence
  endContinuousCommit: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => {
      // Helper to clear pending continuous action timers and commit if necessary
      const flushContinuousCommit = (state: ProjectState) => {
        if (state.continuousTimer) {
          clearTimeout(state.continuousTimer);
        }
        if (state.tempPastState && state.project) {
          const newPast = [...state.past, state.tempPastState].slice(-MAX_HISTORY_DEPTH);
          return {
            past: newPast,
            future: [] as WProject[],
            tempPastState: null as WProject | null,
            continuousTimer: null as NodeJS.Timeout | null,
            lastChangedElementId: null as string | null,
          };
        }
        return {
          past: state.past,
          future: state.future,
          tempPastState: null as WProject | null,
          continuousTimer: null as NodeJS.Timeout | null,
          lastChangedElementId: null as string | null,
        };
      };

      return {
        project: null,
        past: [],
        future: [],
        tempPastState: null,
        continuousTimer: null,
        lastChangedElementId: null,

        setProject: (project) => {
          set((state) => {
            const flushed = flushContinuousCommit(state);
            return {
              ...flushed,
              project,
              past: [],
              future: [],
            };
          });
        },

        updateProject: (recipe, commitType = "discrete", elementId) => {
          const state = get();
          if (!state.project) return;

          // Compute the next project state via Immer
          const nextProject = produce(state.project, (draft) => {
            recipe(draft);
            draft.updatedAt = new Date().toISOString();
          });

          if (commitType === "ignore") {
            set({ project: nextProject });
            return;
          }

          if (commitType === "discrete") {
            set((curr) => {
              // Flush any active continuous commits first
              const flushed = flushContinuousCommit(curr);
              const newPast = [...flushed.past, curr.project!].slice(-MAX_HISTORY_DEPTH);
              return {
                ...flushed,
                project: nextProject,
                past: newPast,
                future: [],
              };
            });
            return;
          }

          if (commitType === "continuous") {
            // Continuous changes (e.g. typing or active drag)
            set((curr) => {
              let savedBaseState = curr.tempPastState;
              let nextPast = curr.past;

              // If the element changed or we have no stored base state, commit the previous one and start a new anchor
              if (!savedBaseState || (elementId && curr.lastChangedElementId !== elementId)) {
                if (savedBaseState && curr.project) {
                  nextPast = [...curr.past, savedBaseState].slice(-MAX_HISTORY_DEPTH);
                }
                savedBaseState = curr.project; // capture baseline before this new continuous stream
              }

              // Reset/setup the debounce timeout to commit this stream after inactivity
              if (curr.continuousTimer) {
                clearTimeout(curr.continuousTimer);
              }

              const timer = setTimeout(() => {
                get().endContinuousCommit();
              }, 500); // 500ms debounce window

              return {
                project: nextProject,
                past: nextPast,
                tempPastState: savedBaseState,
                continuousTimer: timer,
                lastChangedElementId: elementId || null,
              };
            });
          }
        },

        endContinuousCommit: () => {
          set((curr) => {
            if (curr.continuousTimer) {
              clearTimeout(curr.continuousTimer);
            }
            if (curr.tempPastState) {
              const newPast = [...curr.past, curr.tempPastState].slice(-MAX_HISTORY_DEPTH);
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
            // First flush any active continuous action
            const flushed = flushContinuousCommit(curr);
            const activePast = flushed.past;
            
            if (activePast.length === 0 || !curr.project) return {};

            const previous = activePast[activePast.length - 1];
            const remainingPast = activePast.slice(0, -1);
            const newFuture = [curr.project, ...curr.future].slice(0, MAX_HISTORY_DEPTH);

            return {
              ...flushed,
              project: previous,
              past: remainingPast,
              future: newFuture,
            };
          });
        },

        redo: () => {
          set((curr) => {
            const flushed = flushContinuousCommit(curr);
            if (curr.future.length === 0 || !curr.project) return {};

            const next = curr.future[0];
            const remainingFuture = curr.future.slice(1);
            const newPast = [...flushed.past, curr.project].slice(-MAX_HISTORY_DEPTH);

            return {
              ...flushed,
              project: next,
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
            return {
              past: [],
              future: [],
              tempPastState: null,
              continuousTimer: null,
              lastChangedElementId: null,
            };
          });
        },
      };
    },
    {
      name: "takegumi-project-storage",
      storage: indexedDBStorage,
      partialize: (state) => ({
        project: state.project,
        // We only persist the current project, not history stacks or timers
      }) as any,
    }
  )
);
