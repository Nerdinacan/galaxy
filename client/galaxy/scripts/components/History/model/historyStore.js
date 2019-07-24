import VuexPersistence from "vuex-persist";
import { ContentLoader } from "./ContentLoader";
import { Histories$, updateHistoryList, deleteHistoryFromList, 
    CurrentHistoryId$, setCurrentHistoryId } from "./History";
import { updateHistoryFields, createHistory, cloneHistory, 
    deleteHistoryById, makePrivate, showAllHiddenContent, 
    deleteAllHiddenContent, purgeDeletedContent, 
    deleteContent, bulkUpdate } from "./queries";
import { SearchParams } from "./SearchParams";
import { flushCachedDataset, cacheContent, 
    createPromiseFromOperator } from "caching";
import { setEquals } from "utils/setFunctions";

// Holds subscriptions to ContentLoaders
const loaderSubscriptions = new Map();

// alpha sort object array on indicated prop
const propAlphaSort = propName => (a, b) => {
    const AA = a.name.toUpperCase();
    const BB = b.name.toUpperCase();
    return AA < BB ? -1 : AA > BB ? 1 : 0;
}

export const state = {
    currentHistoryId: null,

    // history.id -> history object
    histories: [],

    // history.id -> SearchParams object
    params: {},

    // history.id -> array of contentItems (datasets/collections)
    contents: {},

    // history.id -> Set of contentItem
    contentSelection: {}
};

export const getters = {
    currentHistory: (state, getters) => {
        return getters.getHistory(state.currentHistoryId);
    },

    histories: state => {
        return state.histories;
    },

    getHistory: state => id => {
        return state.histories.find(h => h.id == id);
    },

    searchParams: (state, getters) => id => {
        if (!(id in state.params)) {
            const history = getters.getHistory(id);
            state.params[id] = SearchParams.createForHistory(history);
        }
        return state.params[id];
    },

    historyContent: state => id => {
        if (!(id in state.contents)) {
            state.contents[id] = [];
        }
        return state.contents[id];
    },

    contentSelection: state => history => {
        const key = history.id;
        if (!(key in state.contentSelection)) {
            state.contentSelection[key] = new Set();
        }
        return state.contentSelection[key];
    }
};

export const actions = {
    // Select a new current history from the available options, must
    // alert server because it is monitoring this for no clear reason

    selectCurrentHistory({ state }, id) {
        if (state.currentHistoryId !== id) {
            setCurrentHistoryId(id);
        }
    },

    // History objects

    async updateHistoryFields(context, { history, fields }) {
        const updatedHistory = await updateHistoryFields(history, fields);
        updateHistoryList(updatedHistory); // inform observable
        return updatedHistory;
    },

    async createNewHistory({ dispatch }) {
        const newHistory = await createHistory();
        updateHistoryList(newHistory); // inform observable
        return newHistory;
    },

    async copyHistory({ dispatch }, { history, name, copyWhat }) {
        const newHistory = await cloneHistory(history, name, copyWhat);
        updateHistoryList(newHistory); // inform observable
        return newHistory;
    },

    async deleteHistory({ dispatch }, { history, purge } = { purge: false }) {
        dispatch("unsubLoader", history.id);
        await deleteHistoryById(history.id, purge); // inform server
        deleteHistoryFromList(history); // inform observable
        return history;
    },

    async deleteCurrentHistory({ getters, dispatch }, { purge } = { purge: false }) {
        const history = getters.currentHistory;
        if (history) {
            dispatch("deleteHistory", { history, purge });
        }
        return dispatch("selectNextHistory");
    },

    async makeHistoryPrivate({ getters, dispatch }, { history }) {
        return await makePrivate(history.id);
    },

    async selectNextHistory({ state, getters, dispatch }) {
        let nextHistory;
        if (state.histories.length) {
            nextHistory = state.histories[0];
        } else {
            nextHistory = await dispatch("createNewHistory");
        }
        await dispatch("selectCurrentHistory", nextHistory.id);
        return nextHistory;
    },

    // Search parameters for a given history
    // Controls output and query contents

    setSearchParams({ commit }, { history, params }) {
        commit("setSearchParams", {
            history,
            params: params.clone()
        });
    },

    // Subscribes to an observable that returns content as observed
    // from IndexDB and runs polling updates for the indicated history

    loadContent({ commit }, historyId) {
        if (!loaderSubscriptions.has(historyId)) {
            const sub = ContentLoader(historyId).subscribe({
                next: contents => commit("setHistoryContents", { historyId, contents }),
                error: err => console.warn("ContentLoader err", err),
                complete: () => console.log("ContentLoader complete")
            });
            loaderSubscriptions.set(historyId, sub);
        }
    },

    unsubLoader(context, id) {
        if (loaderSubscriptions.has(id)) {
            loaderSubscriptions.get(id).unsubscribe();
            loaderSubscriptions.delete(id);
        }
    },

    // Current dataset/dataset collection selection from the history content

    setContentSelection({ commit, getters }, { history, selection }) {
        const existingSelection = getters.contentSelection(history);
        if (!setEquals(existingSelection, selection)) {
            commit("setContentSelection", { history, selection });
        }
    },

    clearContentSelection({ commit }, { history }) {
        commit("setContentSelection", { history });
    },

    // Show/hide all content independent of selection polling should handle the
    // updates if the update-time is properly udpated

    showAllHiddenContent({ getters }) {
        return showAllHiddenContent(getters.currentHistory);
    },

    deleteAllHiddenContent({ getters }) {
        return deleteAllHiddenContent(getters.currentHistory);
    },

    purgeDeletedContent({ getters }) {
        return purgeDeletedContent(getters.currentHistory);
    },

    // Content

    deleteContent(_, { content }) {
        deleteContent(content).then(() => {
            flushCachedDataset(content);
        });
    },

    undeleteContent(_, { content }) {
        return deleteContent(content);
    },

    async updateSelectedContent({ getters }, { history, field, value }) {
        const contentSet = getters.contentSelection(history);
        const items = Array.from(contentSet)
            .filter(c => c[field] != value)
            .map(c => ({
                id: c.id,
                history_content_type: c.history_content_type
            }));
        const payload = { items, [field]: value };
        const updates = await bulkUpdate(history, payload);
        const cacheFn = createPromiseFromOperator(cacheContent);
        for (const item of updates) {
            await cacheFn(item);
        }
    }
};

export const mutations = {
    setCurrentHistoryId: (state, id) => {
        state.currentHistoryId = id;
    },

    setHistories: (state, list = []) => {
        state.histories = list.sort(propAlphaSort("name"));
    },

    setSearchParams: (state, { history, params }) => {
        state.params = Object.assign({}, state.params, {
            [history.id]: params
        });
    },

    setHistoryContents: (state, { historyId, contents }) => {
        state.contents = Object.assign({}, state.contents, {
            [historyId]: contents
        });
    },

    setContentSelection: (state, { history, selection = new Set() }) => {
        state.contentSelection = Object.assign({}, state.contentSelection, {
            [history.id]: selection
        });
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};

// Plugins and addons

export const historyPersist = new VuexPersistence({
    key: "state-history",
    storage: sessionStorage,
    modules: ["history"]
});

// Plugin to subscribe to global observables for initial loading
// and real-time updates. The actions in the history store don't
// usually update the history list or the content directly, but
// instead push new objects onto the observable pipes and just
// subscribe to the end result.

export const observeHistory = ({ commit }) => {
    CurrentHistoryId$.subscribe({
        next: id => {
            // console.log("CurrentHistoryId", id);
            commit("history/setCurrentHistoryId", id);
        },
        error: err => console.warn("CurrentHistory$ error", err),
        complete: () => console.log("CurrentHistory$ complete")
    });

    Histories$.subscribe({
        next: list => {
            // console.log("Histories$", list);
            commit("history/setHistories", list);
        },
        error: err => console.warn("Histories$, error", err),
        complete: () => console.log("Histories$ complete")
    });
};
