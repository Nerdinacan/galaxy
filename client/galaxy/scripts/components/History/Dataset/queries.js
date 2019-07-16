import axios from "axios";
import { prependPath } from "utils/redirect";


export async function updateDataset(history_id, dataset_id, payload) {
    const path = `/api/histories/${history_id}/contents/datasets/${dataset_id}`;
    const url = prependPath(path);
    const response = await axios.put(url, payload);
    if (response.status != 200) {
        throw new Error(response);
    }
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


