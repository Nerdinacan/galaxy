/**
 * History store
 */

import { getHistories, getHistoryById } from "./services";

const state = {
    histories: [],
    currentHistory: null
};

const actions = {
    selectHistory({ commit }, id) {
        getHistoryById(id).subscribe(
            result => commit("setCurrentHistory", result),
            err => console.warn("loadHistory error", err)
        );
    },

    loadHistories({ commit }) {
        getHistories().subscribe(
            result => commit("setHistories", result),
            err => console.warn("loadHistories error", err)
        );
    }
};

const mutations = {
    setHistories(state, newHistories) {
        state.histories = [...newHistories];
    },
    setCurrentHistory(state, history) {
        state.currentHistory = history;
    }
};

// const getters = {
//     currentHistory() {
//         let matcher = h => h.id == state.currentHistoryId;
//         return state.histories.find(matcher);
//     }
// };

export default {
    namespaced: true,
    state,
    actions,
    mutations
    // getters
};
