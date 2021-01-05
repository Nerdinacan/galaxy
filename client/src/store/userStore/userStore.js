import { getCurrentUser } from "./queries";
import User from "./User";

const state = {
    currentUser: null,
};

const getters = {
    // Store user as plain json props so we can
    // persist it easily in localStorage or something,
    // hydrate with model object using the getter
    currentUser(state) {
        const userProps = state.currentUser || {};
        if (!userProps) {
            console.warn("no user props!");
        }
        return new User(userProps);
    },
};

const mutations = {
    setCurrentUser(state, user) {
        state.currentUser = user;
    },
};

const actions = {
    async loadUser({ commit }) {
        const user = await getCurrentUser();
        commit("setCurrentUser", user);
    },
};

export const userStore = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
