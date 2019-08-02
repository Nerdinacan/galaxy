// General history component
export { default as History } from "./History";

// Adapter: backbone view that mounts HistoryPanel
export { default as HistoryPanel } from "./HistoryPanel";

// Adapter: backbone view that mounts HistoryPanel
// Destroy when we no longer need to mount inside backbone
export { default as HistoryPanelProxy } from "./HistoryPanelProxy";

// Easier to globally register some components because of recursion
import Vue from "vue";
import ContentItem from "./Content/ContentItem";
Vue.component('content-item', ContentItem);

// css adapter to fit single panel inside the criminal unified-panel nonsense
import "./history.scss";
