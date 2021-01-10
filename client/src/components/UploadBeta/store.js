export const UPLOADSTATUS = Object.freeze({
    OK: { label: "ok", variant: "success" },
});

// Individual file config vars
const defaultFileStatus = {
    genome: null,
    extension: null,
    progress: 0.0,
};

const state = {
    isOpen: false,
    active: true,
    queue: [],
};

const getters = {
    queue(state) {
        return state.queue || [];
    },
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
        return { totalSize, completedSize, portion };
    },
};

const mutations = {
    setIsOpen(state, val) {
        state.isOpen = val;
    },
    setActive(state, val) {
        state.active = val;
    },
    enqueue(state, payload) {
        const { file, opts = {} } = payload;
        const status = { ...defaultFileStatus, ...opts };
        const item = { file, status };
        state.queue.push(item);
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
        const newVal = !state.isOpen;
        console.log("toggleDialog", newVal);
        commit("setIsOpen", newVal);
    },
    toggleActive({ commit, state }) {
        const newVal = !state.active;
        console.log("toggleActive", newVal);
        commit("setIsActive", newVal);
    },
    enqueue({ commit }, payload) {
        console.log("enqueue", payload);
        commit("enqueue", payload);
    },
    cancel({ commit }, idx) {
        console.log("removeFromQueue", idx);
        commit("removeFromQueue", idx);
    },
    reset({ commit }) {
        console.log("reset");
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
