import { updateDataset } from "./queries";
import { cacheDataset, createCacheFunction } from "../model/observables/CachedData";

export const state = {};
export const getters = {};
export const mutations = {};

export const actions = {
    async updateDatasetFields(context, { history_id, dataset_id, fields }) {
        const updated = await updateDataset(history_id, dataset_id, fields);
        const cacheFn = createCacheFunction(cacheDataset);
        const cachedDataset = await cacheFn(updated);
        return cachedDataset;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}