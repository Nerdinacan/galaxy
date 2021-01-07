const UPLOADSTATUS = Object.freeze({
    OK: "ok",
});

export const state = {
    // Overall upload status
    status: null,
    // 0-1 value representing how close we are to done
    progress: 0.0,
};

// export const getters = {};

export const mutations = {
    setStatus({ state }, val) {
        state.status = val;
    },
    setProgress({ state }, val) {
        state.progress = val;
    },
};

export const actions = {
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
};

export const uploadStore = {
    namespaced: true,
    state,
    // getters,
    mutations,
    actions,
};

// TODO: delete when global Galaxy is gone or all upload features have been ported to Vue
export const syncUploadToGalaxy = (store) => {};

// syncUploadToGalaxy((uploadModel) => {
//     const { status, percentage } = uploadModel.attributes;
//     store.commit("upload/setStatus", status);
//     store.commit("upload/setProgress", percentage / 100);
// });
