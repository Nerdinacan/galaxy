export const UPLOADSTATUS = Object.freeze({
    OK: { label: "ok", variant: "success" },
});

const state = {
    // Overall upload status
    status: UPLOADSTATUS.OK,
    // 0-1 value representing how close we are to done
    progress: 0.25,
    // dialog open/close
    isOpen: false,
    // is currently uploading
    active: true,
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
    setActive(state, val) {
        state.active = val;
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
    toggleActive({ commit, state }) {
        commit("setIsActive", !state.active);
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
