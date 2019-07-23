import Vue from "vue";
import VuexPersistence from "vuex-persist";
import { ContentLoader } from "./observables/ContentLoader";
import { Histories$, updateHistoryList, deleteHistoryFromList, 
    CurrentHistoryId$, setCurrentHistoryId } from "./observables/History";
import { updateHistoryFields, createHistory, cloneHistory, deleteHistoryById,
    makePrivate, showAllHiddenContent, deleteAllHiddenContent, purgeDeletedContent,
    deleteContent, bulkUpdate } from "./queries";
import { SearchParams } from "./SearchParams";
import { flushCachedDataset, cacheContent, createPromiseFromOperator } from "caching";
import { setEquals } from "utils/setFunctions";


// container for a bunch of observables for querying content
// for individual histories, doesn't seem appropriate to put
// this in the state since it's just housing the subscriptions
// to the observables that ultimately populate state.contents

// Holds subscriptions to ContentLoaders
const loaderSubscriptions = new Map();

export const state = {
    currentHistoryId: null,

    // history.id -> history object
    histories: new Map(),

    // history.id -> SearchParams object
    params: new Map(),

    // history.id -> array of contentItems (datasets/collections)
    contents: new Map(),

    // history.id -> Set of contentItem
    contentSelection: new Map()
}

export const getters = {
    currentHistory: (state, getters) => {
        return getters.getHistory(state.currentHistoryId);
    },

    histories: state => {
        return Array.from(state.histories.values());
    },

    getHistory: state => id => {
        return state.histories.has(id) ? state.histories.get(id) : null;
    },

    searchParams: (state, getters) => id => {
        if (!state.params.has(id)) {
            const history = getters.getHistory(id);
            state.params.set(id, SearchParams.createForHistory(history));
        }
        return state.params.get(id);
    },

    historyContent: state => id => {
        if (!state.contents.has(id)) {
            state.contents.set(id, []);
        }
        return state.contents.get(id);
    },

    contentSelection: state => history => {
        const key = history.id;
        const storage = state.contentSelection;
        if (!storage.has(key)) {
            storage.set(key, new Set());
        }
        return storage.get(key);
    }
}

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
        await dispatch("selectCurrentHistory", newHistory.id);
        return newHistory;
    },

    async copyHistory({ dispatch }, { history, name, copyWhat }) {
        const newHistory = await cloneHistory(history, name, copyWhat);
        updateHistoryList(newHistory); // inform observable
        await dispatch("selectCurrentHistory", newHistory.id);
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

    // TODO: examine order of events
    async selectNextHistory({ getters, dispatch }) {
        let nextHistory;
        if (getters.histories.length) {
            nextHistory = getters.histories[0];
            await dispatch("selectCurrentHistory", nextHistory.id);
        } else {
            nextHistory = await dispatch("createNewHistory");
        }
        return nextHistory;
    },

    // Search parameters for a given history
    // Controls output and query contents

    setSearchParams({ commit }, { history, params }) {
        // console.log("setSearchParams", params.start, params.end, params.showHidden, params.showDeleted, params.textFilter);
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

    deleteContent({ getters }, { content }) {
        deleteContent(content).then(() => {
            flushCachedDataset(content);
        });
    },

    undeleteContent({ getters }, { content }) {
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
}

export const mutations = {
    setCurrentHistoryId: (state, id) => {
        state.currentHistoryId = id;
    },

    setHistories: (state, list = []) => {
        const historyMap = new Map(list.map(h => [h.id, h]));
        Vue.set(state, "histories", historyMap);
    },

    setSearchParams: (state, { history, params }) => {
        const newMap = new Map(state.params);
        newMap.set(history.id, params);
        Vue.set(state, "params", newMap);
    },

    setHistoryContents: (state, { historyId, contents }) => {
        const newContents = new Map(state.contents);
        newContents.set(historyId, contents);
        Vue.set(state, "contents", newContents);
    },

    setContentSelection: (state, { history, selection = new Set() }) => {
        const newMap = new Map(state.contentSelection);
        newMap.set(history.id, selection);
        Vue.set(state, "contentSelection", newMap);
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}


export const historyPersist = new VuexPersistence({
    key: "state-history",
    storage: sessionStorage,
    modules: ["history"]
})


// Plugin to subscribe to global observables for initial loading
// and real-time updates. The actions in the history store don't
// usually update the history list or the content directly, but
// instead push new objects onto the observable pipes and just
// subscribe to the end result.

export const observeHistory = ({ commit }) => {

    CurrentHistoryId$.subscribe({
        next: id => {
            // console.log("CurrentHistoryId", id);
            commit("history/setCurrentHistoryId", id)
        },
        error: err => console.warn("CurrentHistory$ error", err),
        complete: () => console.log("CurrentHistory$ complete")
    })

    Histories$.subscribe({
        next: list => {
            // console.log("Historis$", list);
            commit("history/setHistories", list)
        },
        error: err => console.warn("Histories$, error", err),
        complete: () => console.log("Histories$ complete")
    })

}
