/**
 * Root Store
 */

import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import invocation from "../components/WorkflowMonitor/MonitorVuex/store";

export const store = new Vuex.Store({
    modules: { invocation }
});
