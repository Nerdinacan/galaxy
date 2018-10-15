/**
 * History store
 */

// import { ajax } from "./util";
import { getHistories, getHistoryById } from "./services";

const state = {
    histories: [],
    currentHistory: null
};

const actions = {
    loadHistory({ commit }, id) {
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
    },
    selectHistory({ commit, dispatch }, id) {
        dispatch("loadHistory", id);
    }
};

const mutations = {
    setHistories(state, newHistories) {
        state.histories = [...newHistories];
    },
    setCurrentHistory(state, history) {
        state.currentHistory = history;
    }
    // selectHistory(state, id) {
    //     state.currentHistoryId = id;
    // }
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
