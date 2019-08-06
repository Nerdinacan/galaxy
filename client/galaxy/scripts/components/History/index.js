// General history component
export { default as History } from "./History";

// Adapter: backbone view that mounts HistoryPanel
export { default as HistoryPanel } from "./HistoryPanel";

// Adapter: backbone view that mounts HistoryPanel
// Destroy when we no longer need to mount inside backbone
export { default as HistoryPanelProxy } from "./HistoryPanelProxy";

// a few global styles, might move into base
import "./history.global.scss";