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

import { of } from "rxjs";
import { ajax } from "../util";

export function getHistories() {
    return ajax({ url: "histories" });
}

// todo: implement pagination paraeters here
export function getHistoryById(id) {
    return id ? ajax({ url: `histories/${id}` }) : of(null);
}

export function getHistoryContents(history, startIndex = 0, endIndex = null) {
    return ajax({ url: `histories/${history.id}/contents` });
}
