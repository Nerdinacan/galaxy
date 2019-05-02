import axios from "axios";
// import { History } from "./History";
// import { Dataset } from "./unused/Dataset";


export async function getCurrentHistory() {
    let url = `/history/current_history_json`;
    let response = await axios.get(url);
    if (response.status !== 200)
        throw new Error(`Unable to load current history`);
    return response.data;
}



export async function getHistoryById(historyID) {
    let url = `/api/histories/${historyID}`;
    let response = await axios.get(url);
    if (response.status !== 200)
        throw new Error(`Unable to load history: ${historyID}`);
    return response.data;
}


// async function processHistory(historyData) {
//     let history = createHistory(historyData);
//     history.datasets = await getDatasetsForHistory(history);
//     return history;
// }


// looks like there's a bunch of pagination params on this
// query, will look at that later
// https://usegalaxy.org/api/histories/63978d771232105d/contents
//?limit=500&offset=0&order=hid&v=dev&q=deleted&q=purged&q=visible&qv=False&qv=False&qv=True
export async function getDatasetsForHistory(history) {
    if (!history.contents_url) {
        return [];
    }
    let response = await axios.get(history.contents_url);
    if (response.status !== 200) {
        throw new Error(`Unable to load datasets for history: ${history.id}`);
    }
    return response.data;
    // return response.data.map(ds => Dataset.create({ ...ds, historyId: history.id }));
}


export async function getHistories() {
    let response = await axios.get(`/api/histories`);
    if (response.status !== 200)
        throw new Error(`Unable to load current history`);
    return response.data.map(History.create);
}


export async function updateHistory(history) {
    // PUT /api/histories/1cd8e2f6b131e891
    let response = await axios.put(`/api/histories/${history.id}`, history);
    if (response.status !== 200) {
        throw new Error("unable to save history", response);
    }
    return history;
}


export async function insertHistory(newHistory) {
    // POST /api/histories/1cd8e2f6b131e891
    throw new Error("Unimplemented, do we do this?");
}


export async function updateDataset(ds) {
    let url = `/api/histories/${ds.historyId}/contents/datasets/${ds.id}`;
    console.log("updateDataset url", url);
    let response = await axios.put(url, ds);
    if (response.status != 200) {
        throw new Error(`Unable to save dataset`);
    }
    return response.data;
    // return Dataset.create(response.data);
}
