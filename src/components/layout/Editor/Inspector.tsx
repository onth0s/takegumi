export default function Inspector() {
  return (
    <div className="w-1/4 border-l border-border-subtle bg-surface-elevated text-text-secondary text-sm flex flex-col">
      <InspectorHeader />
      <div className="p-4">Inspector</div>
    </div>
  );
}

function InspectorHeader() {
  return (
    <div className="flex px-4 h-14 items-center font-medium text-text-primary text-sm bg-surface border-b-2 border-border-subtle">
      Inspector Header
    </div>
  );
}
