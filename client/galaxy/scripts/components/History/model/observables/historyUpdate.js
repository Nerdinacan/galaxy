/**
 * Rxjs operator that takes
 */
import { pipe } from "rxjs";
import { map, take, mergeMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { firstItem } from "utils/observable";
import { cacheHistory } from "caching";
import { prependPath } from "utils/redirect";


export const historyUpdate = (debug) => pipe(
    map(buildHistoryUrl(debug)),
    map(prependPath),
    mergeMap(url => ajax.getJSON(url)),
    take(1),
    firstItem(),
    cacheHistory(true)
);


// Requests a history with same id but newer update time. Triggers on
// server should update the history so this will show up with no results
// unless something's been updated.

const buildHistoryUrl = debug => history => {

    const base = "/api/histories?view=detailed&keys=size,non_ready_jobs,contents_active,hid_counter";
    const idCriteria = `q=encoded_id-in&qv=${history.id}`;
    const updateCriteria = `q=update_time-gt&qv=${history.update_time}`;
    
    const parts = [ base, idCriteria, updateCriteria ];
    const url = parts.filter(o => o.length).join("&");

    if (debug) {
        console.groupCollapsed("buildHistoryUrl");
        console.log("history", history);
        console.groupEnd();
    }

    return url;
}
