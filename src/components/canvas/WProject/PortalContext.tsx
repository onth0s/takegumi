import { createContext, useContext } from "react";

export interface PortalContextValue {
  bordersTarget: HTMLDivElement | null;
  selectionTarget: HTMLDivElement | null;
}

export const PortalContext = createContext<PortalContextValue | null>(null);

export function usePortalTargets() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortalTargets must be used within a PortalProvider");
  }
  return context;
}
