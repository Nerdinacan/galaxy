import { concat } from "rxjs";
import { tap, first, map, distinctUntilChanged } from "rxjs/operators";
import { cacheHistory } from "./CachedData";
import { ajaxGet, firstItem } from "./utils";

/**
 * Compares local database history to version on server,
 * updates local db version if server was fresher
 * @param {Observable} oldHistory$ History retrieved from the database
 * @return {Observable} Observable history
 */
export function CheckHistory$(oldHistory$) {

    // ajaxGet from server if update_time stale
    // will not cache or emit if no fresh results
    const serverHistory$ = oldHistory$.pipe(
        map(buildHistoryUrl),
        ajaxGet(),
        firstItem(),
        cacheHistory(),
        tap(() => console.log("taking server history"))
    );

    // if server result, take that otherwise db version good enough
    return concat(serverHistory$, oldHistory$).pipe(
        first(),
        // distinctUntilChanged(compareStateLists)
    );
}

function buildHistoryUrl(oldHistory) {
    const base = "/api/histories?view=detailed&keys=size,non_ready_jobs,contents_active,hid_counter";
    const idCriteria = `q=encoded_id-in&qv=${oldHistory.id}`;
    const updateCriteria = (oldHistory.update_time) ? `q=update_time-gt&qv=${oldHistory.update_time}` : "";
    const parts = [ base, updateCriteria, idCriteria ];
    return parts.filter(o => o.length).join("&");
}


// compare state lists for 2 histories
function compareStateLists(a,b) {
    return true;
}