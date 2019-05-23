// General history component
export { default as History } from "./History";

// Adapter: backbone view that mounts HistoryPanel
export { default as CurrentHistoryPanel  } from "./CurrentHistoryPanel";

// Adapter: backbone view that mounts HistoryPanel
// Destroy when we no longer need to mount inside backbone
export { default as HistoryPanelProxy  } from "./HistoryPanelProxy";

// css adapter to adapt into the criminal unified-panel nonsense
import "./history.scss";