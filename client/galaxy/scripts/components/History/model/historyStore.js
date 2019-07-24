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
import { sortBy } from "underscore";


// Holds subscriptions to ContentLoaders
const loaderSubscriptions = new Map();


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

    setSearchParams({ commit }, params) {
        commit("setSearchParams", params.clone());
    },

    // Subscribes to an observable that returns content as observed
    // from IndexDB and runs polling updates for the indicated history

    loadContent({ commit }, historyId) {
        if (!loaderSubscriptions.has(historyId)) {
            const sub = ContentLoader(historyId).subscribe({
                next: contents => {
                    commit("setHistoryContents", { historyId, contents });
                },
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

        // "deleted" needs special handling because RxDB uses deleted as a
        // built-in property, we've added an additional property to all
        // the schemas called "isDeleted"
        const localField = (field == "deleted") ? "isDeleted" : "field";

        const items = Array.from(contentSet)
            .filter(c => c[localField] != value)
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
        const newList = sortBy(list, "name");
        state.histories = newList;
    },

    setSearchParams: (state, params) => {
        state.params = Object.assign({}, state.params, {
            [params.historyId]: params
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


/**
 * Persists some store data in the session, not using this
 * yet, since it has some loading issues.
 */
export const historyPersist = new VuexPersistence({
    
    key: "vuex-state-history",
    storage: sessionStorage,
    modules: ["history"],

    // only save some of the history module
    saveState(key, { history }, storage) {
        
        // console.log("saveState", history);
        
        const { currentHistoryId, histories, params } = history;
        
        const payload = {
            history: {
                currentHistoryId,
                histories,
                params
            }
        };

        storage.setItem(key, JSON.stringify(payload));
    },

    restoreState(key, storage) {

        let payload = {
            history: {
                params: {}
            }
        };

        if (!(key in storage)) {
            return payload;
        }

        try {

            const frozenState = storage[key];
            const frozen = JSON.parse(frozenState);
            payload = Object.assign(payload, frozen);
    
            // hydrate SearchParams
            const oldParams = payload.history.params;
            payload.history.params = Object.keys(oldParams)
                .reduce((result, id) => ({
                    ...result,
                    [id]: new SearchParams(oldParams[id])
                }), {});
            
        } catch(err) {
            console.warn("history store unable to restore", err);
        }

        return payload;
    }

});


/**
 * Vuex plugin to subscribe to global history list and global current user
 * object. Both are rxjs observables and this subscription lasts the lifetime of
 * the application so I haven't bothered unsubscribing it.
 */
export const observeHistory = ({ commit }) => {

    CurrentHistoryId$.subscribe({
        next: id => {
            // console.log("CurrentHistoryId", id);
            commit("history/setCurrentHistoryId", id);
        },
        error: err => console.warn("CurrentHistory$ error", err),
        complete: () => console.log("CurrentHistory$ complete")
    })

    Histories$.subscribe({
        next: list => {
            // console.log("Histories$", list);
            commit("history/setHistories", list);
        },
        error: err => console.warn("Histories$, error", err),
        complete: () => console.log("Histories$ complete")
    })

}
