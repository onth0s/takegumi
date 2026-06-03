"use client";

const VARIANT_LAYOUT: Record<"home" | "editor", string> = {
  home: "flex-[6.5] h-64 rounded-xl bg-background px-6 text-center",
  editor: "flex-[6.5] h-52 rounded-2xl px-8",
};

interface Props {
  id: string;
  variant: "home" | "editor";
  isDragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onOpen: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageDropZone({
  id,
  variant,
  isDragOver,
  fileInputRef,
  onOpen,
  onKeyDown,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      id={id}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        "group flex flex-col items-center justify-center gap-2",
        "border-2 border-dashed cursor-pointer",
        "transition-colors duration-200 outline-none",
        "focus-visible:ring-1 focus-visible:ring-accent/50",
        VARIANT_LAYOUT[variant],
        isDragOver
          ? "border-accent bg-accent/5"
          : "border-border-default/60 hover:border-accent/50 hover:bg-accent/5",
      ].join(" ")}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        className="text-text-tertiary group-hover:text-accent/40 transition-colors duration-200"
      >
        <rect x="3" y="3" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M3 24l8-7 6 6 4-4 12 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-sm text-text-secondary group-hover:text-accent transition-colors duration-200">
        Drop images here
      </p>
      <p className="text-xs text-text-tertiary">or click to browse</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
