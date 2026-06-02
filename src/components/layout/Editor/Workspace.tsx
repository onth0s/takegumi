export default function Workspace() {
  return (
    <div className="flex flex-1 flex-col h-full w-full bg-background text-foreground overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Viewport />
        <Inspector />
      </div>
      <StatusBar />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center px-4 py-2 text-xs text-text-tertiary border-t border-border-subtle bg-surface-elevated">
      Status bar
    </div>
  );
}

function Viewport() {
  return <div className="flex-1 bg-grid" />;
}

function Inspector() {
  return (
    <div className="w-1/4 border-l border-border-subtle bg-surface-elevated text-text-secondary text-sm p-4 flex flex-col gap-4">
      <p className="font-medium text-text-primary">Inspector Header</p>
      Inspector
    </div>
  );
}