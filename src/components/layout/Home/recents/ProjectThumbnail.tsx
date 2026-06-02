"use client";

import { WPanelImage } from "@/components/canvas";

interface Props {
  thumbnailSrc: string | null;
  variant: "grid" | "list";
}

function PlaceholderIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="text-text-tertiary group-hover:text-accent transition-colors duration-150 flex-shrink-0"
    >
      <path
        d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19ZM19 19H5V5H19V19Z"
        fill="currentColor"
      />
      <path d="M7 12H17V14H7V12Z" fill="currentColor" />
      <path d="M7 7H17V9H7V7Z" fill="currentColor" />
    </svg>
  );
}

export default function ProjectThumbnail({ thumbnailSrc, variant }: Props) {
  const isGrid = variant === "grid";
  const imageClass = isGrid
    ? "w-full h-full rounded-md object-cover border border-border-subtle group-hover:border-accent/40 transition-colors duration-150"
    : "w-full h-full rounded object-cover border border-border-subtle group-hover:border-accent/40 transition-colors duration-150";
  const placeholderClass = isGrid
    ? "w-full h-full rounded-md border border-border-default flex items-center justify-center bg-background group-hover:border-accent/40 transition-colors duration-150"
    : "w-full h-full rounded border border-border-default flex items-center justify-center bg-background group-hover:border-accent/40 transition-colors duration-150";

  if (thumbnailSrc) {
    return <WPanelImage imageUrl={thumbnailSrc} className={imageClass} />;
  }

  return (
    <div className={placeholderClass}>
      <PlaceholderIcon size={isGrid ? 32 : 20} />
    </div>
  );
}
