/**
 * Store definition for upload
 */

import STATUS from "../status";

const defaultOptions = {
    space_to_tab: false,
    to_posix_lines: true,
};

const getDefaultState = () => ({
    // uploading is happening
    active: false,

    // set preserves insert order, works for queue
    files: new Set(),

    // options (file -> object)
    // individual file properties for use during the actual upload
    fileOptions: new Map(),

    // status (file -> status object)
    // INIT/RUNNING/PAUSED/ERROR/COMPLETE
    fileStatus: new Map(),

    // progress (file -> 0-1)
    fileProgress: new Map(),
});

const state = {
    // dialog is open/closed
    isOpen: false,
    ...getDefaultState(),
};

const getters = {
    // overall Status

    status(state) {
        return STATUS.COMPLETE;
    },

    progress(state, getters) {
        const initVal = {
            totalSize: 0.0,
            completedSize: 0.0,
        };
        const doCount = (acc, item) => {
            const { file, progress } = item;
            acc.totalSize += file.size;
            acc.completedSize += file.size * progress;
            return acc;
        };
        const { totalSize, completedSize } = getters.queue.reduce(doCount, initVal);
        const portion = totalSize > 0 ? completedSize / totalSize : 0;

        return { totalSize, completedSize, portion };
    },

    // return complete file list + all options as an array

    queue(state) {
        return Array.from(state.files).map((file) => {
            // set default options
            const options = state.fileOptions.get(file) || defaultOptions;
            const status = state.fileStatus.get(file) || STATUS.INIT;
            const progress = state.fileProgress.get(file) || 0.0;
            // return one object
            return { file, options, status, progress };
        });
    },
};

const mutations = {
    // Set flags
    setIsOpen(state, val) {
        state.isOpen = val;
    },

    setActive(state, val) {
        state.active = val;
    },

    // List of files to be uploaded

    addFile(state, file) {
        const newFiles = new Set(state.files);
        newFiles.add(file);
        state.files = newFiles;
    },

    removeFile(state, file) {
        const newFiles = new Set(state.files);
        newFiles.delete(file);
        state.files = newFiles;
    },

    // Options, current status, upload progress

    setFileOptions(state, { file, options }) {
        const newMap = new Map(state.fileOptions);
        newMap.set(file, options);
        state.fileOptions = newMap;
    },

    removeFileOptions(state, file) {
        const newMap = new Map(state.fileOptions);
        newMap.delete(file);
        state.fileOptions = newMap;
    },

    setFileStatus(state, { file, status }) {
        const newMap = new Map(state.fileStatus);
        newMap.set(file, status);
        state.fileStatus = newMap;
    },

    removeFileStatus(state, file) {
        const newMap = new Map(state.fileStatus);
        newMap.delete(file);
        state.fileStatus = newMap;
    },

    setFileProgress(state, { file, progress }) {
        const newMap = new Map(state.fileProgress);
        newMap.set(file, progress);
        state.fileProgress = newMap;
    },

    removeFileProgress(state, file) {
        const newMap = new Map(state.fileProgress);
        newMap.delete(file);
        state.fileProgress = newMap;
    },

    reset(state) {
        Object.assign(state, getDefaultState());
    },
};

const actions = {
    // Overall status flags

    toggleDialog({ commit, state }) {
        commit("setIsOpen", !state.isOpen);
    },

    setIsActive({ commit }, val) {
        commit("setActive", val);
    },

    toggleActive({ commit, state }) {
        commit("setActive", !state.active);
    },

    // add or update file and/or options to queue

    enqueue({ commit }, { file, options, status, progress }) {
        if (!state.files.has(file)) {
            commit("addFile", file);
        }
        if (options !== undefined) {
            commit("setFileOptions", { file, options });
        }
        if (status !== undefined) {
            commit("setFileStatus", { file, status });
        }
        if (progress !== undefined) {
            commit("setFileProgress", { file, progress });
        }
    },

    remove({ commit }, file) {
        commit("removeFileProgress", file);
        commit("removeFileOptions", file);
        commit("removeFileStatus", file);
        commit("removeFile", file);
    },

    // Play/pause buttons for individual files

    startFile({ commit }, file) {
        commit("setFileStatus", { file, status: STATUS.INIT });
    },

    pauseFile({ commit }, file) {
        commit("setFileStatus", { file, status: STATUS.PAUSED });
    },

    toggleFile({ commit, getters }, file) {
        const item = getters.queue.find((f) => f.file == file);
        const existingStatus = item.status;
        const status = existingStatus.id == STATUS.PAUSED.id ? STATUS.INIT : STATUS.PAUSED;
        commit("setFileStatus", { file, status });
    },

    // Reset state

    reset({ commit }) {
        // dispatch("cancelAll");
        commit("reset");
    },
};

export const uploadStore = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
