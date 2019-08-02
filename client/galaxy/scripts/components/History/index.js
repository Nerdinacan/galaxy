// General history component
export { default as History } from "./History";

// Adapter: backbone view that mounts HistoryPanel
export { default as HistoryPanel } from "./HistoryPanel";

// Adapter: backbone view that mounts HistoryPanel
// Destroy when we no longer need to mount inside backbone
export { default as HistoryPanelProxy } from "./HistoryPanelProxy";

// css adapter to fit single panel inside the criminal unified-panel nonsense
import "./history.scss";
