export const UPLOADSTATUS = Object.freeze({
    OK: { label: "ok", variant: "success" },
});

const defaultStatus = { genome: null, extension: null, progress: 0.0 };

const state = {
    // dialog open/close
    isOpen: false,
    // is currently uploading
    active: true,
    // file -> status
    queue: [],
};

const getters = {
    progress(state) {
        const initVal = { totalSize: 0.0, completedSize: 0.0 };
        const doCount = (acc, item) => {
            const { file, status } = item;
            acc.totalSize += file.size;
            acc.completedSize += file.size * status.progress;
            return acc;
        };
        const { totalSize, completedSize } = state.queue.reduce(doCount, initVal);
        const portion = totalSize > 0 ? completedSize / totalSize : 0;
        return { totalSize, portion };
    },
};

const mutations = {
    setIsOpen(state, val) {
        state.isOpen = val;
    },
    setActive(state, val) {
        state.active = val;
    },
    enqueue(state, { file, opts = {} }) {
        const status = { ...defaultStatus, ...opts };
        state.queue.push({ file, status });
    },
    removeFromQueue(state, idx) {
        state.queue.splice(idx, 1);
    },
    resetQueue(state) {
        state.queue = [];
    },
};

const actions = {
    toggleDialog({ commit, state }) {
        commit("setIsOpen", !state.isOpen);
    },
    toggleActive({ commit, state }) {
        commit("setIsActive", !state.active);
    },
    enqueue({ commit }, payload) {
        commit("enqueue", payload);
    },
    cancel({ commit }, idx) {
        commit("removeFromQueue", idx);
    },
    reset({ commit }) {
        commit("resetQueue");
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
