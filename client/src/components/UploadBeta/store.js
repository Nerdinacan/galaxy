export const UPLOADSTATUS = Object.freeze({
    OK: { label: "ok", variant: "success" },
});

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
        const initVal = { totalSize: 0.0, complete: 0.0 };
        const doCount = (acc, item) => {
            const { file, status } = item;
            acc.totalSize += file.size;
            acc.complete += file.size * status.progress;
            return acc;
        };
        const { totalSize, complete } = state.queue.reduce(doCount, initVal);
        const percentage = totalSize > 0 ? complete / totalSize : 0;
        return { totalSize, complete, percentage };
    },
};

const mutations = {
    setIsOpen(state, val) {
        state.isOpen = val;
    },
    setActive(state, val) {
        state.active = val;
    },
    addToQueue(state, file) {
        const status = { progress: 0.0 };
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
    enqueue({ commit }, file) {
        commit("addToQueue", file);
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
