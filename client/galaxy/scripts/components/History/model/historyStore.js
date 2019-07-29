import VuexPersistence from "vuex-persist";
import { ContentLoader } from "./ContentLoader";
import { Histories$, updateHistoryList, deleteHistoryFromList, 
    CurrentHistoryId$, setCurrentHistoryId } from "./History";
import { updateHistoryFields, createHistory, cloneHistory, 
    deleteHistoryById, makePrivate, showAllHiddenContent, 
    deleteAllHiddenContent, purgeDeletedContent, 
    deleteContent, bulkUpdate } from "./queries";
import { SearchParams } from "./SearchParams";
import { flushCachedDataset, cacheContent, createPromiseFromOperator } from "caching";
import { sortBy } from "underscore";

// Holds subscriptions to ContentLoaders
// history.id -> subscription
const loaderSubscriptions = new Map();


export const state = {

    currentHistoryId: null,

    // history.id -> history object
    histories: [],

    // history.id -> SearchParams object
    params: {},

    // history.id -> array of contentItems (datasets/collections)
    contents: {},

    // history.id -> Set of type_ids
    contentSelection: {},
}

export const mutations = {

    setCurrentHistoryId: (state, id) => {
        state.currentHistoryId = id;
    },

    setHistories: (state, list = []) => {
        const newList = sortBy(list, "name");
        state.histories = newList;
    },

    setSearchParams: (state, params) => {
        state.params = {
            ...state.params,
            [params.historyId]: params
        };
    },

    setHistoryContents: (state, { historyId, contents }) => {
        state.contents = {
            ...state.contents,
            [historyId]: contents
        }
    },

    setContentSelection: (state, { historyId, typeIds }) => {
        state.contentSelection = {
            ...state.contentSelection,
            [historyId]: new Set(typeIds)
        }
    }
}

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
            if (history) {
                return SearchParams.createForHistory(history);
            } else {
                debugger;
                return null;
            }
        }
        return state.params[id];
    },

    historyContent: state => id => {
        if (!(id in state.contents)) {
            return [];
        }
        return state.contents[id];
    },

    //#region selection

    contentSelectionSet: state => historyId => {
        if (!(historyId in state.contentSelection)) {
            // state.contentSelection[historyId] = new Set();
            return new Set();
        }
        return state.contentSelection[historyId];
    },

    contentSelection: (_, getters) => historyId => {
        const selection = getters.contentSelectionSet(historyId);
        const contents = getters.historyContent(historyId);
        return contents.filter(c => selection.has(c.type_id));
    },

    contentIsSelected: (_, getters) => contentItem => {
        const selection = getters.contentSelectionSet(contentItem.history_id);
        return selection.has(contentItem.type_id);
    }

    //#endregion selection
}

export const actions = {

    //#region History selection
    
    // Select a new current history from the available options, must
    // alert server because it is monitoring this for no clear reason

    selectCurrentHistory({ state }, id) {
        if (state.currentHistoryId !== id) {
            setCurrentHistoryId(id);
        }
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

    //#endregion


    //#region History CRUD & operations

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

    async deleteHistory({ state }, { history, purge } = { purge: false }) {
        await deleteHistoryById(history.id, purge);
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

    async updateHistoryFields(context, { history, fields }) {
        const updatedHistory = await updateHistoryFields(history, fields);
        updateHistoryList(updatedHistory); // inform observable
        return updatedHistory;
    },

    //#endregion


    //#region Search Params
  
    setSearchParams({ commit }, params) {
        // Search parameters for a given history
        // Controls output and query contents
        commit("setSearchParams", params.clone());
    },

    //#endregion


    //#region Content Loading, observable generation
    
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

    unsubLoader(_, id) {
        if (loaderSubscriptions.has(id)) {
            loaderSubscriptions.get(id).unsubscribe();
            loaderSubscriptions.delete(id);
        }
    },

    //#endregion


    //#region Content selection

    setContentSelection({ commit }, { history, selection = [] }) {
        commit("setContentSelection", { 
            historyId: history.id, 
            typeIds: selection.map(c => c.type_id)
        });
    },

    clearContentSelection({ dispatch }, { history }) {
        dispatch("setContentSelection", { history });
    },

    selectContentItem({ getters, commit }, { content }) {        
        const existingSelection = getters.contentSelectionSet(content.history_id);
        const newSelection = new Set(existingSelection);
        newSelection.add(content.type_id);
        commit("setContentSelection", {
            historyId: content.history_id,
            typeIds: newSelection
        })
    },

    unselectContentItem({ getters, commit }, { content }) {        
        const existingSelection = getters.contentSelectionSet(content.history_id);
        const newSelection = new Set(existingSelection);
        newSelection.delete(content.type_id);
        commit("setContentSelection", {
            historyId: content.history_id,
            typeIds: newSelection
        })
    },

    //#endregion


    //#region Content CRUD and operations

    async showAllHiddenContent({ getters }) {
        return await showAllHiddenContent(getters.currentHistory);
    },

    async deleteAllHiddenContent({ getters }) {
        return await deleteAllHiddenContent(getters.currentHistory);
    },

    async purgeDeletedContent({ getters }) {
        return await purgeDeletedContent(getters.currentHistory);
    },

    async deleteContent(_, { content }) {
        await deleteContent(content);
        await flushCachedDataset(content);
    },

    async undeleteContent(_, { content }) {
        return await deleteContent(content);
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

    //#endregion
};


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}



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
