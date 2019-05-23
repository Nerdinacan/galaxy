import Vue from "vue";
import VuexPersistence from "vuex-persist";

import { ContentLoader } from "./observables/ContentLoader";
import { HistoryList$, updateHistory, deleteHistory } from "./observables/HistoryList$";
import { CurrentHistory$, setCurrentHistoryId } from "./observables/CurrentHistory$";

import {
    updateHistoryFields, createHistory, cloneHistory, 
    deleteHistoryById, makePrivate, 
    showAllHiddenContent, deleteAllHiddenContent,
    purgeDeletedContent, deleteContent,
    bulkUpdate
} from "./queries";

import { SearchParams } from "./SearchParams";
import { flushCachedDataset, cacheContentItem } from "./observables/CachedData";
import { setEquals } from "utils/setFunctions";


// container for a bunch of observables for querying content
// for individual histories, doesn't seem appropriate to put
// this in the state since it's just housing the subscriptions
// to the observables that ultimately populate state.contents

// history.id => ContentLoader
const loaders = new Map();


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
        debugger;
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

    searchParams: state => id => {
        if (!state.params.has(id)) {
            state.params.set(id, new SearchParams());
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


    // USED
    // Select a new current history from the available options, must
    // alert server because it is monitoring this for some damned reason

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

    setSearchParams({ commit, getters }, { history, params }) {
        const existingParams = getters.searchParams(history.id);
        if (!SearchParams.equals(existingParams, params)) {
            commit("setSearchParams", { 
                history, 
                params: params.clone()
            });
        }
    },


    // History content subscription, manages subscription to
    // the observable that monitors the indexDB content query
    // for the indicated history/params. We transplanted the
    // subscription for the observable here into the store

    loadContent({ commit }, { history, params }) {
        const id = history.id;
        let loader;
        if (!loaders.has(id)) {
            loader = ContentLoader(history);
            loader.subscribe(contents => {
                commit("setHistoryContents", { history, contents });
            });
            loaders.set(id, loader);
        }
        loader = loaders.get(id);
        loader.setParams(params);
    },

    unsubLoader(context, id) {
        if (loaders.has(id)) {
            loaders.get(id).unsubscribe();
            loaders.delete(id);
        }
    },


    // Current dataset/dataset collection selection from the history content
    // check to make sure it's not the same as what's in the store or we
    // go in infinite loops

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


    // Datasets

    deleteContent({ getters }, { content }) {
        deleteContent(content).then(result => {
            flushCachedDataset(content);
        });
    },

    undeleteContent({ getters }, { content }) {
        return deleteContent(content);
    },

    async updateSelectedContent({ getters, dispatch }, { history, field, value }) {
        const contentSet = getters.contentSelection(history);
        const items = Array.from(contentSet)
            .filter(c => c[field] != value)
            .map(c => ({ 
                id: c.id, 
                history_content_type: c.history_content_type
            }));
        const payload = { items, [field]: value }; // this is not awesome
        const updates = await bulkUpdate(history, payload);
        for (let item of updates) {
            await cacheContentItem(item);
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

    setHistoryContents: (state, { history, contents }) => {
        const newContents = new Map(state.contents);
        newContents.set(history.id, contents);
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



// localstorage persistence handles re-hydration of
// json representation of the History model

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

    CurrentHistory$.subscribe(ch => {
        commit("history/setCurrentHistoryId", ch.id);
    });

    HistoryList$.subscribe(list => {
        commit("history/setHistories", list);
    });

}
