/**
 * History store
 */

import { ajax } from "./util";

const state = {
    histories: [],
    currentHistoryId: null
};

const actions = {
    loadHistories({ commit }) {
        ajax({ url: "histories" }).subscribe(
            result => commit("setHistories", result),
            err => console.warn("loadHistories error", err)
        );
    },
    selectHistory({ commit }, id) {
        commit("selectHistory", id);
    }
};

const mutations = {
    setHistories(state, newHistories) {
        state.histories = [...newHistories];
    },
    selectHistory(state, id) {
        state.currentHistoryId = id;
    }
};

const getters = {
    currentHistory() {
        let matcher = h => h.id == state.currentHistoryId;
        return state.histories.find(matcher);
    }
};

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
