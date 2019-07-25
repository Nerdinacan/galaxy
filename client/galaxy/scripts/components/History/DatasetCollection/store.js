import { createDatasetCollection } from "./queries";
import { cacheContent, createPromiseFromOperator } from "caching";


import { of } from "rxjs";


const state = {
    currentCollectionId: null
}

const getters = {}

const actions = {

    async createCollection(context, { history, selection }) {
        const ajaxResult = await createDatasetCollection(history, selection);
        const cacheFn = createPromiseFromOperator(cacheContent, true);
        return await cacheFn(ajaxResult);
    }

}

const mutations = {
    setCurrentCollectionId(state, id = null) {
        state.currentCollectionId = id;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
