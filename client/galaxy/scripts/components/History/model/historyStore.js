import Vue from "vue";
import VuexPersistence from "vuex-persist";
import { ContentLoader } from "./observables/ContentLoader";
import { CurrentHistory$, setCurrentHistory } from "./observables/CurrentHistory$";
import { getHistories, updateHistoryFields } from "./queries";


// container for a bunch of observables for querying content
// for individual histories, didn't seem appropriate to put
// it in state

const loaders = new Map();



// STATE

export const state = {
    currentHistory: null,
    histories: [], // Map?
    contents: {}, // Map?
    contentSelection: []
}

export const getters = {
    historyContent: state => id => {
        return state.contents[id] || [];
    }
}

export const actions = {

    loadContent({ commit }, { history, params }) {
        let loader, id = history.id;
        if (!loaders.has(id)) {
            loader = ContentLoader(history);
            loader.subscribe(contents => {
                commit("setHistoryContents", { id, contents });
            });
            loaders.set(id, loader);
        }
        loader = loaders.get(id);
        loader.setParams(params);
    },

    unsubLoader(context, id) {
        if (loaders.has(id)) {
            loaders.get(id).unsubscribe();
            loaders.delete(id);
        }
    },

    updateCurrentHistory(context, newHistory)  {
        setCurrentHistory(newHistory);
    },

    async loadHistories({ commit }) {
        let list = await getHistories();
        commit("setHistoryList", list);
    },

    async updateHistory({ commit }, { history, fields }) {
        let newHistory = await updateHistoryFields(history, fields);
        commit("setHistory", newHistory);
    }

}

export const mutations = {

    setCurrentHistory: (state, newHistory) => {
        Vue.set(state, "currentHistory", newHistory);
    },

    // overwrite existing history
    setHistory: (state, history) => {
        let histories = state.histories.filter(h => h.id !== history.id);
        state.histories = [ ...histories, history ];
    },

    setHistoryList: (state, list) => {
        Vue.set(state, "histories", list);
    },

    setHistoryContents: (state, { id, contents }) => {
        Vue.set(state.contents, id, contents);
    },

    setContentSelection: (state, newList = []) => {
        const incomingList = Array.from(new Set(newList)).sort();
        if (!arraysEqual(incomingList, state.contentSelection)) {
            Vue.set(state, "contentSelection", incomingList);
        }
    }

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}



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
    })
}


// simple array comparison

function arraysEqual(a,b) {
    return JSON.stringify(a) == JSON.stringify(b);
}
