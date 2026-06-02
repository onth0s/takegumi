import type { WPanel } from "@/types/canvas";
import { IMPORT_PANEL_WIDTH } from "@/constants/canvasDefaults";
import { createBlankPanel } from "@/utils/createProject";
import { savePanelImage, toLocalImageUrl } from "@/utils/panelImageStorage";

async function finalizePanel(panel: WPanel, file: Blob): Promise<WPanel> {
  await savePanelImage(panel.id, file);
  panel.imageUrl = toLocalImageUrl(panel.id);
  return panel;
}

/**
 * Converts a FileList or File array into fully-initialised WPanel objects.
 * Each image is stored in the binary blob store under `local://<panelId>`.
 * Dimensions are computed from the image's natural aspect ratio at
 * {@link IMPORT_PANEL_WIDTH}.
 */
export async function processImageFiles(files: FileList | File[]): Promise<WPanel[]> {
  const fileArray = Array.from(files);

  return Promise.all(
    fileArray.map(
      (file) =>
        new Promise<WPanel>((resolve) => {
          const tempUrl = URL.createObjectURL(file);
          const img = new Image();
          img.src = tempUrl;

          const complete = async (panel: WPanel) => {
            URL.revokeObjectURL(tempUrl);
            resolve(await finalizePanel(panel, file));
          };

          img.onload = () => {
            const aspect = img.naturalHeight / img.naturalWidth;
            const height = Math.round(IMPORT_PANEL_WIDTH * aspect);
            complete(createBlankPanel({ width: IMPORT_PANEL_WIDTH, height }));
          };

          img.onerror = () => {
            complete(createBlankPanel());
          };
        })
    )
  );
}
