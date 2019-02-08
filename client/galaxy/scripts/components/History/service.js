/**
 * History data ajax requests
 */
import axios from "axios";
import { createHistory, createDataset } from "./model";


/**
 * Retrieve currently selected user history
 * @returns Promise yielding a History object
 */
export async function getCurrentHistory() {
    let url = `/history/current_history_json`;
    let rsp = await axios.get(url);
    if (rsp.status !== 200)
        throw new Error(`Unable to load current history`);
    return processHistory(rsp.data);
}


/**
 * Loads a single history by id
 * @param {String} historyID 
 * @return Promise yielding a history object
 */
export async function getHistoryById(historyID) {
    let url = `/api/histories/${historyID}`;
    let rsp = await axios.get(url);
    if (rsp.status !== 200)
        throw new Error(`Unable to load history: ${historyID}`);
    return processHistory(rsp.data);
}


/**
 * hydrate history fields and load child datasets
 * @param {object} historyData 
 * @return Promise yielding a history object
 */
async function processHistory(historyData) {
    let history = createHistory(historyData);
    history.datasets = await getDatasetsForHistory(history);
    return history;
}


/**
 * Retrieve datasets for indicated history model. 
 * @param {Object} history 
 * @returns Promise yielding an array of datasets
 */
export async function getDatasetsForHistory(history) {
    if (!history.contents_url)
        return new Map();
    let rsp = await axios.get(history.contents_url);
    if (rsp.status !== 200)
        throw new Error(`Unable to load datasets for history: ${history.id}`);
    return rsp.data.map(ds => createDataset({ ...ds, history }));
}


/**
 * History List
 */
export async function getHistories() {
    let rsp = await axios.get(`/api/histories`);
    if (rsp.status !== 200)
        throw new Error(`Unable to load current history`);
    return rsp.data.map(createHistory);
}
