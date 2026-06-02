import localforage from "localforage";

// Create a dedicated localforage instance for raw image files/blobs.
// IndexedDB is highly optimized for storing binary Blobs directly.
export const imageBlobStore = localforage.createInstance({
  name: "Takegumi",
  storeName: "panel_images",
});
