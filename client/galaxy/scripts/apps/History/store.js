/**
 * History store. Here the current history is something
 * that is stored in the state instead of an observable
 */
import { getHistories, getHistoryById } from "./services";

const state = {
    histories: [],
    currentHistory: null
};

const actions = {
    selectHistory({ commit }, id) {
        getHistoryById(id).subscribe(
            result => commit("selectHistory", result),
            err => console.warn("error", err)
        );
    },
    loadHistories({ commit }) {
        getHistories().subscribe(
            result => commit("loadHistories", result),
            err => console.warn("error", err)
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
    state,
    actions,
    mutations
    // getters
};
