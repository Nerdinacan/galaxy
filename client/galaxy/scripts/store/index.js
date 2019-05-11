/**
 * Central Vuex store
 */

import Vue from "vue";
import Vuex from "vuex";
import { gridSearchStore } from "./gridSearchStore";
import { tagStore } from "./tagStore";
import historyStore, { historyPersist, observeHistory } 
    from "components/History/model/historyStore";

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        gridSearch: gridSearchStore,
        tags: tagStore,
        history: historyStore
    },
    plugins: [
        // historyPersist.plugin,
        observeHistory
    ]
})

export default store;
