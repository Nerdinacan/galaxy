import { Quota$ } from "./Quota$";

const state = {};
const getters = {};
const actions = {};
const mutations = {};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}

export const observeQuota = ({ commit }) => {
    Quota$.subscribe(q => {
        console.log("quota", q);
        // commit("quota/setCurrentHistoryId", ch.id);
    });
}
