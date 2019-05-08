import VuexPersistence from "vuex-persist";
import { CurrentHistory$, setCurrentHistory } from "./model";
import { HistoryList$ } from "./model";

export const state = {
    currentHistory: null,
    histories: []
};

export const getters = {
    currentHistory: state => state.currentHistory,
    histories: state => state.histories
};

export const actions = {
    // manual update
    updateCurrentHistory(context, newHistory)  {
        setCurrentHistory(newHistory);
    }
};

export const mutations = {
    setCurrentHistory: (state, newHistory) => {
        state.currentHistory = newHistory;
    },
    setHistoryList: (state, list) => {
        state.histories = list;
    }
};

export default {
    namespaced: true,
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
        console.log("observable updating store", history);
        store.commit("history/setCurrentHistory", history);
    });

    HistoryList$.subscribe(list => {
        console.log("Initial history list", list);
        store.commit("history/setHistoryList", list);
    });
}
