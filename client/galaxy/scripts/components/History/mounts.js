// For mounting the component in non-vue environments
import HistoryPanel from "./HistoryPanel";
import { mountVueComponent } from "utils/mountVueComponent";

export const mountHistory = mountVueComponent(HistoryPanel);
