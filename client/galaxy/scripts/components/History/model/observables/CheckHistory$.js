import { concat }from "rxjs";
import { pluck, map, first, share } from "rxjs/operators";
import { cacheHistory, getCachedHistory } from "./CachedData";
import { ajaxGet, firstItem } from "./utils";


/**
 * Compares local database history to version on server,
 * updates local db version if server was fresher
 * @param {object} h history
 * @return {Observable} Observable history
 */
export function CheckHistory$(h$) {

    // clean params
    const history$ = h$.pipe(share());

    // get existing database value
    const dbHistory$ = history$.pipe(
        pluck('id'),
        getCachedHistory()
    );

    // ajaxGet from server if update_time stale
    const serverHistory$ = history$.pipe(
        map(buildHistoryUrl),
        ajaxGet(),
        firstItem(),
        cacheHistory()
    );

    // if server result, take that otherwise db version good enough
    return concat(serverHistory$, dbHistory$).pipe(
        first()
    );
}


function buildHistoryUrl(history) {
    const base = "/api/histories?view=dev-detailed&keys=visible,contents_active";
    const idCriteria = `q=encoded_id-in&qv=${history.id}`;
    const updateCriteria = (history.update_time) ? `q=update_time-gt&qv=${history.update_time}` : "";
    const parts = [ base, updateCriteria, idCriteria ];
    return parts.filter(o => o.length).join("&");
}
