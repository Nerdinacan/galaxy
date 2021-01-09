export const UPLOADSTATUS = Object.freeze({
    OK: { label: "ok", variant: "success" },
});

const state = {
    // Overall upload status
    status: null,
    // 0-1 value representing how close we are to done
    progress: 0.0,
    // dialog open/close
    isOpen: false,
};

const mutations = {
    setStatus(state, val) {
        state.status = val;
    },
    setProgress(state, val) {
        state.progress = val;
    },
    setIsOpen(state, val) {
        state.isOpen = val;
    },
};

const actions = {
    setState({ commit }, newState) {
        if (newState in UPLOADSTATUS) {
            commit("setState", newState);
        }
    },
    setProgress({ commit }, val) {
        const newProgress = Number(val * 1.0);
        if (newProgress < 0 || newProgress > 1) {
            throw new Error("progress value out of range: `${val}");
        }
        commit("setProgress", newProgress);
    },
    toggleDialog({ commit, state }) {
        commit("setIsOpen", !state.isOpen);
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
