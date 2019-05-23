import { getGalaxyInstance } from "app";

export const state = {}

export const getters = {
    currentUser() {
        const Galaxy = getGalaxyInstance();
        return (Galaxy && Galaxy.user) ? Galaxy.user : null;
    },
    hasUser(state, getters) {
        const user = getters.currentUser;
        return user && user.id;
    }
};

export const actions = {};

export const mutations = {};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
