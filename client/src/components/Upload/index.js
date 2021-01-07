// Bootstrap modal wrapping the main UI
export { default as UploadModal } from "./UploadModal";

// Button that launches the modal
export { default as UploadButton } from "./UploadButton";

// button and main UI need a place to share common status and progress values
export { store as uploadStore, syncUploadToGalaxy } from "./store";

// backbone button that mounts and opens the modal.
// Does the same thing as UploadButton but from backbone
export { mountUploadModal } from "./mount";
