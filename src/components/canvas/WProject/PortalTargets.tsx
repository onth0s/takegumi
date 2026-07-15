export function PortalTargets() {
  return (
    <>
      {/* Portal target for synthetic borders — sits above panel images, below WTGs */}
      <div id="panel-borders-portal-target" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }} />

      {/* Portal target for panel selection/hover rings — always on top */}
      <div id="panel-selection-portal-target" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 25 }} />
    </>
  );
}
