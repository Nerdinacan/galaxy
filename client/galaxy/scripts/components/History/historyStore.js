import VuexPersistence from "vuex-persist";
import { CurrentHistory$ } from "./model";

export const state = {
    currentHistory: null
};

export const getters = {
    currentHistory: state => state.currentHistory
};

export const actions = {};

export const mutations = {
    setCurrentHistory: (state, newHistory) => {
        state.currentHistory = newHistory;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};



// localstorage persistence handles re-hydration of
// json representation of the History model

export const historyPersist = new VuexPersistence({
    key: "state-history",
    storage: sessionStorage, 
    modules: ['history']
})


// plugin to subscribe to global observables

export const observeHistory = store => {
    CurrentHistory$.subscribe(history => {
        // console.log("Initial load of current history", history);
        store.commit("setCurrentHistory", history);
    });
}
