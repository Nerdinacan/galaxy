import axios from "axios";


export async function getHistories() {
    const url = "/api/histories?view=dev-detailed";
    const response = await axios.get(url);
    return response.data || [];
}


// pass in a dictionary of fields to update
export async function updateHistoryFields(history, payload) {

    const url = `/api/histories/${history.id}`;
    const response = await axios.put(url, payload);
    if (!response.status == 200) {
        console.warn("bad updateHistoryFields", response);
        throw new Error(response);
    }

    // merge the new data in (or else go to the server again)
    // view doesn't return consistent field set with other queries
    // current_history_json, get history, and save history all return
    // different hashes
    return Object.assign({}, history, response.data);
}


export async function loadHistoryById(id) {
    const url = `/api/histories/${id}`;
    const response = await axios.get(url);
    return response.data; // history object
}