/**
 * Data retrieval calls to the workflow invocation endpoints.
 */

import axios from "axios";
import { getAppRoot } from "loadConfigs";

const root = getAppRoot() + "api";

/**
 * returns all invocations for a given user
 * GET /api/invocations
 */
export const getAllInvocations = async () => {
    let url = `${root}/invocations`;
    let response = await axios.get(url);
    return response.data;
}

/**
 * Returns all invocations for indicated workflow
 * GET /api/workflows/{workflow_id}/invocations
 *
 * @param {string} workflow_id
 */
export const getInvocationsForWorkflow = async workflow_id => {
    let url = `${root}/workflows/${workflow_id}/invocations`;
    let response = await axios.get(url);
    return response.data;
}

/**
 * Loads invocation details for a specific invocation/workflow
 * GET /api/workflows/{workflow_id}/invocations/{invocation_id}
 *
 * @param {string} workflow_id
 * @param {string} invocation_id
 */
export const getInvocation = async (workflow_id, invocation_id) => {
    let url = `${root}/workflows/${workflow_id}/invocations/${invocation_id}`;
    let response = await axios.get(url);
    return response.data;
}
