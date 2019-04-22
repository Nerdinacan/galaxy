/**
 * History Store
 * 
 * Store 
 */

import VuexPersistence from 'vuex-persist';
import { getCurrentHistory, History } 
    from "components/History/model";


export const state = {
    currentHistoryId: null,
    current: new History() // current root history object
};

export const getters = {};

export const actions = {
    async loadCurrentHistory({ commit }) {
        let result = await getCurrentHistory();
        commit("setCurrentHistory", result);
        return result;
    }
};

export const mutations = {
    setCurrentHistoryId(id) {
        state.currentHistoryId = id;
    },
    setCurrentHistory(state, newHistoryProps) {
        state.current = new History(newHistoryProps);
    }
};


// localstorage persistence handles re-hydration of
// json representation of the History model

export const historyPersist = new VuexPersistence({

    key: "state-history",
    storage: sessionStorage,
    modules: ['history'],

    restoreState: (key, storage) => {
        let json = storage.getItem(key);
        if (json) {
            let newState = JSON.parse(json);
            newState.history.current = new History(newState.history.current);
            return newState;
        }
        return {};
    }
})


export default {
    state,
    getters,
    actions,
    mutations
};
