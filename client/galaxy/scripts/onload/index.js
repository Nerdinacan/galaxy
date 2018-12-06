// Bootstrap overwrites .tooltip() method, so load it after jquery-ui
import "bootstrap";
import "bootstrap-tour";

// Galaxy core styles
import "scss/base.scss";

// Module exports
export { standardInit } from "./standardInit";
export { initializations$, addInitialization, prependInitialization, clearInitQueue } from "./initQueue";
export { config$, set as setConfig, get as getConfig, getAppRoot } from "./loadConfig";
export { getRootFromIndexLink } from "./getRootFromIndexLink";
