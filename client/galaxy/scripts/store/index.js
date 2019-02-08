/**
 * Central Vuex store
 */

import Vue from "vue";
import Vuex from "vuex";
import VuexPersist from 'vuex-persist';

import { gridSearchStore } from "./gridSearchStore";
import { tagStore } from "./tagStore";
import { historyStore } from "./historyStore";

Vue.use(Vuex);


// Experimenting with this plugin, not sure I like this
// mechanism since any vuex objects that are not literals
// or basic objects will be converted to JSON and back, so
// we lose Set, Map, etc
const vuexLocalStorage = new VuexPersist({
    key: 'galaxy-vuex',
    storage: window.localStorage, // or window.sessionStorage or localForage

    // Function that passes the state and returns the 
    // state with only the objects you want to store.
    // reducer: state => state,
    
    // Function that passes a mutation and lets you 
    // decide if it should update the state in localStorage.
    // filter: mutation => (true)
});

export default new Vuex.Store({
    modules: { 
        gridSearch: gridSearchStore, 
        tags: tagStore,
        history: historyStore
    },
    plugins: [ 
        vuexLocalStorage.plugin
    ]
});
