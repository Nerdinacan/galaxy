import Vue from "vue";
import VuexPersistence from "vuex-persist";
import { CurrentHistory$, setCurrentHistory } from "./observables/CurrentHistory$";
import { HistoryList$ } from "./observables/HistoryList$";
import { HistoryContentLoader } from "./HistoryContentLoader";

// container for a bunch of observables for querying content
// for individual histories, didn't seem appropriate to put
// it in state
const loaders = new Map();

export const state = {
    currentHistory: null,
    histories: [],
    contents: {}
};

export const getters = {
    historyContent: state => id => {
        return state.contents[id] || [];
    }
};

export const actions = {

    loadContent({ commit }, { history, params }) {
        console.log("loadContent", history.id, params);
        let loader, id = history.id;
        if (loaders.has(id)) {
            loader = loaders.get(id);
        } else {
            loader = HistoryContentLoader(history);
            loader.subscribe(contents => {
                commit("setHistoryContents", { id, contents });
            });
            loaders.set(id, loader);
        }
        loader.setParams(params);
    },

    unsubLoader(context, id) {
        console.log("unsubLoader", id);
        if (loaders.has(id)) {
            loaders.get(id).unsubscribe();
        }
        loaders.delete(id);
    },

    updateCurrentHistory(context, newHistory)  {
        setCurrentHistory(newHistory);
    }
};

export const mutations = {
    setCurrentHistory: (state, newHistory) => {
        Vue.set(state, "currentHistory", newHistory);
    },
    setHistoryList: (state, list) => {
        Vue.set(state, "histories", list);
    },
    setHistoryContents: (state, { id, contents }) => {
        Vue.set(state.contents, id, contents);
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
        store.commit("history/setCurrentHistory", history);
    });

    HistoryList$.subscribe(list => {
        store.commit("history/setHistoryList", list);
    });

}
