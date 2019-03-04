// Low level stateless UI
export { default as StatelessTags } from "./StatelessTags";

// Wraps in a data storage service and click handler
export { default as Tags } from "./Tags";

// functions for mounting the tag editor in non-Vue environments
export { mountMakoTags, mountModelTags } from "./inits";
