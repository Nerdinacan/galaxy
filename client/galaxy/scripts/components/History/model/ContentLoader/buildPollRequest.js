import { of, pipe } from "rxjs";
import { map, take, takeUntil } from "rxjs/operators";
import { createInputFunction, ajaxGet, firstItem, operateOnArray } from "utils/observable";
import { getCachedHistory, cacheContent, cacheHistory } from "caching";
import moment from "moment";



/**
 * Creates a subject and function to stop polling, primarily for debugging purposes.
 */
export const stopPolling = createInputFunction();




/**
 * Generates an observable for a single poll request for a given history id
 * @param {string} id History Id
 */
export const buildPollRequest = historyId => of(historyId).pipe(
    getCachedHistory(),
    take(1),
    historyUpdate(),
    map(buildContentUrlForHistory),
    ajaxGet(),
    cacheContentArray(),
    takeUntil(stopPolling.$)
)


// Get and cache a fresh version of the history object if one exists

const historyUpdate = debug => pipe(
    map(buildHistoryUrl),
    ajaxGet(),
    firstItem(),
    cacheHistory(debug)
)


// Requests a history with same id but newer update time. Triggers on
// server should update the history so this will show up with no results
// unless something's been updated.

export const buildHistoryUrl = history => {
    const base = "/api/histories?view=detailed&keys=size,non_ready_jobs,contents_active,hid_counter";
    const idCriteria = `q=encoded_id-in&qv=${history.id}`;
    const updateCriteria = `q=update_time-gt&qv=${history.update_time}`;
    const parts = [base, idCriteria, updateCriteria];
    const url = parts.filter(o => o.length).join("&");
    return url;
}


// Requests content if history got a hit. We can't limit by history update_time
// because the dataset collection data does not have an update time
// TODO: add an update time to hdac table

export const buildContentUrlForHistory = history => {
    const base = `/api/histories/${history.id}/contents?v=dev&view=summary&keys=accessible`;
    const since = moment.utc(history.update_time);
    const updateClause = `q=update_time-gt&qv=${since.toISOString()}`
    const parts = [ base, updateClause ];
    return parts.filter(o => o.length).join("&");
}


// Forkjoins an array of cache promises, emits an array of cached objects

const cacheContentArray = debug => pipe(
    operateOnArray(cacheContent(debug)),
)
