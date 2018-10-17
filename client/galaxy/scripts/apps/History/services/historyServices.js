/**
 * Ajax services for history data
 */

/*
https://usegalaxy.org/history/current_history_json
https://usegalaxy.org/api/histories/4c4407f76f8bc94e/contents?limit=500&offset=0&order=hid&v=dev&q=deleted&q=purged&q=visible&qv=False&qv=False&qv=True

histories.py
    GET /api/histories:
        return undeleted histories for the current user
    GET /api/histories/deleted:
        return deleted histories for the current user
    GET /api/histories/{id}:
        return the history with ``id``
    GET /api/histories/deleted/{id}:
        return the deleted history with ``id``
    GET /api/histories/most_recently_used:
        return the most recently used history
    GET /api/histories/published:
        return all histories that are published
    GET /api/histories/shared_with_me:

history_contents.py
    GET /api/histories/{history_id}/contents
*/

import { map } from "rxjs/operators";
import { ajax } from "../util";
import { History, HistorySummary, HistoryContent } from "../model";

// Turns a list of raw json into model objects
export function hydrateList(Constructor) {
    return list => list.map(Constructor);
}

/**
 * Load all histories
 *
 * @returns Observable stream of HistorySummary objects
 */
export function getHistories() {
    let req = { url: "histories" };
    return ajax(req).pipe(map(hydrateList(HistorySummary.hydrate)));
}

/**
 * Load one history detail by id
 *
 * @param {string} id
 * @requires Observable of a single History
 */
export function getHistoryById(id) {
    let req = { url: `histories/${id}` };
    return ajax(req).pipe(map(History.hydrate));
}

/**
 * Loads a paginated slice of the contents of a particular history
 *
 * @param {string} id History id
 * @param {integer} startIndex default 0, start of pagination slice
 * @param {integer} endIndex default null, end of pagination slice
 */
export function getHistoryContents(id, startIndex = 0, endIndex = null) {
    let req = { url: `histories/${id}/contents` };
    return ajax(req).pipe(map(hydrateList(HistoryContent.hydrate)));
}
