import localforage from "localforage";

/** IndexedDB instance for persisted project JSON (Zustand persist adapter). */
export const projectStoreDb = localforage.createInstance({
  name: "Takegumi",
  storeName: "project_store",
});

/** IndexedDB instance for panel image blobs. */
export const imageBlobStore = localforage.createInstance({
  name: "Takegumi",
  storeName: "panel_images",
});
