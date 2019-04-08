// For mounting the component in non-vue environments
import CurrentHistory from "./CurrentHistory";
import { mountVueComponent } from "utils/mountVueComponent";

export const mountHistory = mountVueComponent(CurrentHistory);
