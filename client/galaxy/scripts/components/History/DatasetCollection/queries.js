import axios from "axios";
import { prependPath } from "utils/redirect";
import { safeAssign } from "utils/safeAssign";


export async function createDatasetCollection(history, inputs = {}) {

    console.log("createDatasetCollection", history, inputs);

    const template = {
        "collection_type": "list",
        "copy_elements": true,
        "name": "list",
        "element_identifiers": [],
        "hide_source_items": "True",
        "type": "dataset_collection"
    }

    const url = prependPath(`/api/histories/${history.id}/contents?v=dev&view=summary&keys=accessible`);
    const payload = safeAssign(Object.assign({}, template), inputs);

    const response = await axios.post(url, payload);
    if (response.status != 200) {
        throw new Error(response);
    }

    return response.data;
}
