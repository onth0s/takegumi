import { LOCAL_IMAGE_PREFIX } from "@/constants/canvasDefaults";
import { imageBlobStore } from "@/storage";

export function toLocalImageUrl(panelId: string): string {
  return `${LOCAL_IMAGE_PREFIX}${panelId}`;
}

export function isLocalImageUrl(url: string): boolean {
  return url.startsWith(LOCAL_IMAGE_PREFIX);
}

export function parseLocalPanelId(url: string): string | null {
  if (!isLocalImageUrl(url)) return null;
  return url.slice(LOCAL_IMAGE_PREFIX.length);
}

export async function savePanelImage(panelId: string, blob: Blob): Promise<void> {
  await imageBlobStore.setItem(panelId, blob);
}

export async function getPanelImageBlob(panelId: string): Promise<Blob | null> {
  return imageBlobStore.getItem<Blob>(panelId);
}

export async function deletePanelImage(panelId: string): Promise<void> {
  await imageBlobStore.removeItem(panelId);
}

export async function clearAllPanelImages(): Promise<void> {
  await imageBlobStore.clear();
}
