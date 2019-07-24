/**
 * Central Vuex store
 */

import Vue from "vue";
import Vuex from "vuex";
import createCache from "vuex-cache";

import { gridSearchStore } from "./gridSearchStore";
import { tagStore } from "./tagStore";
import { jobMetricsStore } from "./jobMetricsStore";
import historyStore, { observeHistory, historyPersist } from "components/History/model/historyStore";
import userStore from "store/userStore";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        gridSearch: gridSearchStore,
        tags: tagStore,
        jobMetrics: jobMetricsStore,
        history: historyStore,
        user: userStore
    },
    plugins: [
        createCache(),
        observeHistory,
        // historyPersist.plugin
    ]
});
