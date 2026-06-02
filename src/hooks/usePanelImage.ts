"use client";

import { useEffect, useState } from "react";
import { getPanelImageBlob, isLocalImageUrl, parseLocalPanelId } from "@/utils/panelImageStorage";

export function usePanelImage(imageUrl: string | null) {
  const isRemote = imageUrl != null && !isLocalImageUrl(imageUrl);
  const localPanelId =
    imageUrl != null && isLocalImageUrl(imageUrl) ? parseLocalPanelId(imageUrl) : null;

  const [resolved, setResolved] = useState<{ panelId: string; src: string } | null>(null);

  useEffect(() => {
    if (!localPanelId) return;

    let active = true;
    let objectUrl: string | null = null;

    getPanelImageBlob(localPanelId)
      .then((blob) => {
        if (blob && active) {
          objectUrl = URL.createObjectURL(blob);
          setResolved({ panelId: localPanelId, src: objectUrl });
        }
      })
      .catch((err) => {
        console.error("Failed to load offline image for panel:", localPanelId, err);
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [localPanelId]);

  const localSrc =
    localPanelId && resolved?.panelId === localPanelId ? resolved.src : null;

  if (!imageUrl) {
    return { status: "empty" as const, src: null };
  }
  if (isRemote) {
    return { status: "ready" as const, src: imageUrl };
  }
  if (localSrc) {
    return { status: "ready" as const, src: localSrc };
  }
  return { status: "loading" as const, src: null };
}
