export { default as HistoryPanel } from "./HistoryPanel";

// Used to mount components from inside existing code
// TODO: remove when this component can be normally mounted
// from a vue environment
import HistoryPanel from "./HistoryPanel";
import { mountVueComponent } from "utils/mountVueComponent";
export const mountHistory = mountVueComponent(HistoryPanel);
