"use client";
import { useEffect, useState } from "react";
import { imageBlobStore } from "@/stores/imageStore";

interface Props {
  imageUrl: string | null;
  className?: string;
}

export default function WPanelImage({ imageUrl, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setSrc(null);
      return;
    }

    // If it's a standard URL (like http/https) or an in-memory blob URL, render directly
    if (!imageUrl.startsWith("local://")) {
      setSrc(imageUrl);
      return;
    }

    // Resolve local key from IndexedDB binary store
    const panelId = imageUrl.replace("local://", "");
    let active = true;
    let resolvedUrl: string | null = null;

    imageBlobStore.getItem<Blob>(panelId).then((blob) => {
      if (blob && active) {
        resolvedUrl = URL.createObjectURL(blob);
        setSrc(resolvedUrl);
      }
    }).catch((err) => {
      console.error("Failed to load offline image for panel:", panelId, err);
    });

    return () => {
      active = false;
      if (resolvedUrl) {
        URL.revokeObjectURL(resolvedUrl);
      }
    };
  }, [imageUrl]);

  if (!src) {
    return <div className={`${className} bg-[#808080] animate-pulse`} />;
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      draggable={false}
    />
  );
}
