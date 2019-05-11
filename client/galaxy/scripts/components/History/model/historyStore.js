import Vue from "vue";
import VuexPersistence from "vuex-persist";
import { CurrentHistory$, setCurrentHistory } from "./observables/CurrentHistory$";
import { HistoryList$ } from "./observables/HistoryList$";
import { HistoryContentLoader } from "./HistoryContentLoader";

export const state = {
    currentHistory: null,
    histories: [],
    contents: {}, // map, history.id to contents results
    loaders: {} // map, history.id to loader object
};

export const getters = {
    historyContent: state => id => {
        return state.contents[id] || [];
    }
};

export const actions = {

    loadContent({ state, commit }, { history, params }) {

        let loader;

        if (!(history.id in state.loaders)) {
           
            loader = HistoryContentLoader(history);
            
            loader.sub = loader.content$.subscribe(
                contents => commit("setHistoryContents", { id: history.id, contents }),
                err => console.warn("loader error", err),
                () => console.log("loader complete")
            );

            commit("setContentLoader", { id: history.id, loader });

        } else {
            loader = state.loaders[history.id];
        }
        
        loader.setParams(params);
    },

    unsubLoader({ state, commit }, { history }) {
        if (history.id in state.loaders) {
            let loader = state.loaders[history.id];
            if (loader.sub) {
                loader.sub.unsubscribe();
            }
        }
        commit("removeContentLoader", history.id);
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
    },
    
    // not 100% certain the loder objects need to live in the store
    // since they're just service instances for retrieving content
    setContentLoader: (state, { id, loader }) => {
        Vue.set(state.loaders, id, loader);
    },
    removeContentLoader: (state, id) => {
        Vue.delete(state.loaders, id);
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
