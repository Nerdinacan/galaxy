import { getConfig } from "./queries";

const defaultConfigs = {};

const state = {
    config: null
};

const getters = {
    config: (state) => {
        return state.config || {};
    }
};

const mutations = {
    setConfigs(state, newConfigs = {}) {
        state.config = Object.assign({}, defaultConfigs, state.config || {}, newConfigs);
    },
};

const actions = {
    async loadConfigs({ state, commit }) {
        // only load once
        if (state.config !== null) return;
        const configs = await getConfig();
        commit("setConfigs", configs);
    },
};

export const configStore = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};

export default configStore;
