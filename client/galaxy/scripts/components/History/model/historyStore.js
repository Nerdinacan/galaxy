import Vue from "vue";
import VuexPersistence from "vuex-persist";

import { ContentLoader } from "./observables/ContentLoader";
import { HistoryList$, updateHistory, deleteHistory } from "./observables/HistoryList$";
import { CurrentHistoryId$, setCurrentHistoryId } from "./observables/CurrentHistory$";

import {
    updateHistoryFields, createHistory, cloneHistory, 
    deleteHistoryById, makePrivate, 
    showAllHiddenContent, deleteAllHiddenContent,
    purgeDeletedContent, deleteContent,
    bulkUpdate
} from "./queries";

import { SearchParams } from "./SearchParams";
import { flushCachedDataset, cacheContent, createCacheFunction } from "./observables/CachedData";
import { setEquals } from "utils/setFunctions";

import { log } from "./observables/utils";


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
        return state.histories.has(id) 
            ? state.histories.get(id) 
            : null;
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
        updateHistory(updatedHistory); // inform observable
        return updatedHistory;
    },

    async createNewHistory({ dispatch }) {
        const newHistory = await createHistory();
        updateHistory(newHistory); // inform observable
        await dispatch("selectCurrentHistory", newHistory.id);
        return newHistory;
    },

    async copyHistory({ dispatch }, { history, name, copyWhat }) {
        const newHistory = await cloneHistory(history, name, copyWhat);
        updateHistory(newHistory); // inform observable
        await dispatch("selectCurrentHistory", newHistory.id);
        return newHistory;
    },

    async deleteHistory({ state }, { history, purge } = { purge: false }) {
        await deleteHistoryById(history.id, purge);
        deleteHistory(history); // inform observable
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
        // if we don't do a comparison check here, the components
        // will update over and over
        commit("setSearchParams", {
            history,
            params: params.clone()
        });
    },


    // Subscribes to an observable that returns content as observed
    // from IndexDB and runs polling updates for the indicated history
    
    loadContent({ commit }, historyId) {
        if (!loaderSubscriptions.has(historyId)) {
            const sub = ContentLoader(historyId).subscribe(
                contents => commit("setHistoryContents", { historyId, contents }),
                err => console.warn("ContentLoader err", err),
                () => console.log("ContentLoader complete")
            );
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
            commit("setContentSelection", { history, selection })
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
        const cacheFn = createCacheFunction(cacheContent);
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

    CurrentHistoryId$.pipe(log("CurrentHistoryId$")).subscribe(
        id => commit("history/setCurrentHistoryId", id),
        err => console.warn("CurrentHistory$ error", err), 
        () => console.log("CurrentHistory$ complete")
    );

    HistoryList$.pipe(log("HistoryList$")).subscribe(
        list => commit("history/setHistories", list),
        err => console.warn("HistoryList$, error", err),
        () => console.log("HistoryList$ complete")
    );

}
