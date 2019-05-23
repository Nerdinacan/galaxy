import axios from "axios";
import { prependPath } from "utils/redirect";


export async function getCurrentHistory() {
    const url = prependPath("/history/current_history_json");
    const response = await axios.get(url);
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}



export async function getHistoryById(id) {
    const url = prependPath(`/api/histories/${id}?view=dev-detailed&keys=contents_active`);
    const response = await axios.get(url);
    return response.data; // history object
}


// pass in a dictionary of fields to update
export async function updateHistoryFields(history, payload) {
    const url = prependPath(`/api/histories/${history.id}?view=dev-detailed&keys=contents_active`);
    const response = await axios.put(url, payload);
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}


export async function createHistory() {
    const url = prependPath("/api/histories?view=dev-detailed&keys=contents_active");
    const response = await axios.post(url, { name: "New History" });
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}


export async function cloneHistory(history, name, copyAll) {
    const url = prependPath("/api/histories");
    const response = await axios.post(url, {
        history_id: history.id,
        name,
        all_datasets: copyAll,
        view: "dev-detailed",
        keys: "contents_active",
        current: true
    });
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}


export async function selectCurrentHistory(id) {
    const url = prependPath(`/history/set_as_current?id=${id}`);
    const response = await axios.put(url);
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}


export async function deleteHistoryById(id, purge = false) {
    const path = `/api/histories/${id}` + (purge ? "?purge=True" : "");
    const url = prependPath(path);
    const response = await axios.delete(url);
    if (response.status != 200) {
        throw new Error(response);
    }
    return id;
}


export async function makePrivate(history_id) {
    const url = prependPath('/history/make_private');
    const response = await axios.post(url, formData({ history_id }));
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}


// TODO: write new api endpoint for this operation
// TODO: history parameter currently unused, will be required for
// a new endpoint that I'm going to write though.
export async function showAllHiddenContent(history) {
    return adjustHidden("unhide");
}

// TODO: write new api endpoint for this operation
// TODO: history parameter currently unused, will be required for
// a new endpoint that I'm going to write though.
export async function deleteAllHiddenContent(history) {
    return adjustHidden("delete");
}

// horrible endpoint takes "unhide" or "delete" for actions
async function adjustHidden(user_action) {
    if (!user_action) {
        throw new Error(`unhandled user_action in queries.adjustHidden: ${user_action}`);
    }
    const url = prependPath("/history/adjust_hidden");
    const response = await axios.post(url, formData({ user_action }));
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}


// TODO: write new api endpoint for this operation
// TODO: history parameter currently unused, will be required for
// a new endpoint that I'm going to write though.
export async function purgeDeletedContent(history) {
    // GET for unfathomable reasons
    // https://usegalaxy.org/history/purge_deleted_datasets

    const url = prependPath("/history/purge_deleted_datasets");
    const response = await axios.get(url);
    if (response.status != 200) {
        throw new Error(response);
    }
    return {
        message: parseMessageFromIncompetence(response.data)
    }
}

// TODO: change this endpoint to return json instead of parsing the old html output
// <div class="message mt-2 alert alert-success">4 datasets have been deleted permanently</div>
const scrubHtmlMessage = /message[^>]+>([^><]+)</i;
function parseMessageFromIncompetence(html) {
    const matches = html.match(scrubHtmlMessage);
    return matches[1];
}


// DELETE /api/histories/{history_id}/contents/dataset(_collection)/{id}
export async function deleteContent(c, purge = false, recursive = false) {
    const params = [`purge=${purge}`, `recursive=${recursive}`].join("&");
    const url = `/api/histories/${c.history_id}/contents/${c.history_content_type}s/${c.id}?${params}`;
    const result = await axios.delete(prependPath(url));
    return result;
}





// Content & Dataset Queries



    // Batch property assignment for selected items

    // const batchUpdate = (key, value) => {
    //     const actionModels = {};
    //     const items = panel
    //         .getSelectedModels()
    //         .filter(model => {
    //             console.log(model.attributes[key]);
    //             return model.attributes[key] != value;
    //         })
    //         .map(model => {
    //             const res = {
    //                 history_content_type: model.attributes.history_content_type,
    //                 id: model.attributes.id
    //             };
    //             actionModels[model.id] = model;
    //             // Tried "optimistically" deleting the dataset - but it didn't quite work -
    //             // maybe history polling restored the previous state?
    //             return res;
    //         });

    //     if (items.length == 0) {
    //         return;
    //     }

    //     const options = {};
    //     options.url = `${Galaxy.root}api/histories/${this.model.id}/contents`;
    //     options.type = "PUT";
    //     const requestData = { items: items };
    //     requestData[key] = value;
    //     options.data = JSON.stringify(requestData);
    //     options.contentType = "application/json";

    //     var xhr = jQuery.ajax(options);
    //     xhr.done((message, status, responseObj) => {
    //         for (const updated of message) {
    //             const typeId = updated.history_content_type + "-" + updated.id;
    //             actionModels[typeId].set(updated);
    //         }
    //     });
    //     xhr.fail((xhr, status, message) => {
    //         console.error(message);
    //     });
    //     return xhr;
    // };


export async function bulkUpdate({ id }, payload) {
    if (!payload.items.length) {
        return;
    }
    const url = prependPath(`/api/histories/${id}/contents`);
    const response = await axios.put(url, payload);
    return response.data;
}

export async function loadToolFromDataset(dataset) {
    const { creating_job } = dataset;
    const jobUrl = prependPath(`/api/jobs/${creating_job}?full=false`);
    const jobResponse = await axios.get(jobUrl);
    const { tool_id } = jobResponse.data;
    const toolUrl = prependPath(`/api/tools/${tool_id}/build`);
    const toolResponse = await axios.get(toolUrl);
    const tool = toolResponse.data;
    return tool;
}



// Some of our current endpoints don't accpet JSON, so we need
// to send an old-school form post
function formData(fields = {}) {
    return Object.keys(fields).reduce((result, fieldName) => {
        result.set(fieldName, fields[fieldName]);
        return result;
    }, new FormData());
}
