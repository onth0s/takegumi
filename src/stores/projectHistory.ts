import type { WProject } from "@/types/canvas";

export const MAX_HISTORY_DEPTH = 50;
export const CONTINUOUS_COMMIT_DEBOUNCE_MS = 500;

export type CommitType = "discrete" | "continuous" | "ignore";

export interface HistoryState {
  past: WProject[];
  future: WProject[];
  tempPastState: WProject | null;
  continuousTimer: ReturnType<typeof setTimeout> | null;
  lastChangedElementId: string | null;
}

export function emptyHistoryState(): HistoryState {
  return {
    past: [],
    future: [],
    tempPastState: null,
    continuousTimer: null,
    lastChangedElementId: null,
  };
}

export function flushContinuousCommit(
  state: HistoryState & { project: WProject | null }
): HistoryState {
  if (state.continuousTimer) {
    clearTimeout(state.continuousTimer);
  }

  if (state.tempPastState && state.project) {
    return {
      past: [...state.past, state.tempPastState].slice(-MAX_HISTORY_DEPTH),
      future: [],
      tempPastState: null,
      continuousTimer: null,
      lastChangedElementId: null,
    };
  }

  return {
    past: state.past,
    future: state.future,
    tempPastState: null,
    continuousTimer: null,
    lastChangedElementId: null,
  };
}
