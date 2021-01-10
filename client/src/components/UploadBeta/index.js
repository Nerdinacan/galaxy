import Vue from "vue";
import { BootstrapVueIcons } from "bootstrap-vue";

// Bootstrap modal wrapping the main UI
export { default as UploadModal } from "./UploadModal";

// Button that launches the modal
export { default as UploadButton } from "./UploadButton";

// genomse & types provider
export { default as UploadOptions } from "./providers/UploadOptions";

// button and main UI need a place to share common status and progress values
export { default as uploadStore } from "./store";

// backbone button that mounts and opens the modal.
// Does the same thing as UploadButton but from backbone
export { mountUploadModal } from "./mount";

import "./upload.scss";

Vue.use(BootstrapVueIcons);
