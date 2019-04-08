/**
 * Central Vuex store
 */

import Vue from "vue";
import Vuex from "vuex";
import { gridSearchStore } from "./gridSearchStore";
import { tagStore } from "./tagStore";
import historyStore, { historyPersist } from "./historyStore";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        gridSearch: gridSearchStore,
        tags: tagStore,
        history: historyStore
    },
    plugins: [
        historyPersist.plugin
    ]
})
