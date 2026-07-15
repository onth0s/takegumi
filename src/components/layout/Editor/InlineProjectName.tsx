import { useCallback, useRef, useState } from "react";

interface Props {
  name: string;
  onRename: (name: string) => void;
}

export default function InlineProjectName({ name, onRename }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = useCallback(() => {
    setDraft(name);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }, [name]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) onRename(trimmed);
    setEditing(false);
  }, [draft, name, onRename]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") commit();
      else if (e.key === "Escape") {
        setDraft(name);
        setEditing(false);
      }
    },
    [commit, name]
  );

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="px-1 py-0 text-sm rounded border border-accent bg-surface text-text-primary outline-none min-w-48"
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      className="cursor-default select-none"
      title="Double-click to rename"
    >
      {name}
    </span>
  );
}
