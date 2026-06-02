"use client";

import { usePanelImage } from "@/hooks/usePanelImage";

interface Props {
  imageUrl: string | null;
  className?: string;
}

export default function WPanelImage({ imageUrl, className }: Props) {
  const { status, src } = usePanelImage(imageUrl);

  if (status === "empty" || status === "loading") {
    return <div className={`${className} bg-placeholder animate-pulse`} />;
  }

  return <img src={src} alt="" className={className} draggable={false} />;
}
