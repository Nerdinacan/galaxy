/**
 * Root Store
 */

import Vue from "vue";
import Vuex from "vuex";
import invocations from "../components/WorkflowMonitor/MonitorVuex/store";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        invocations
    }
});
