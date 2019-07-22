import { merge, pipe } from "rxjs";
import { ajax } from "rxjs/ajax";
import { map, filter, startWith, mapTo, switchMap, switchMapTo, share, pluck, withLatestFrom, mergeMap, take } from "rxjs/operators";
import { createInputFunction, split, firstItem } from "utils/observable";
import { history$ as hColl$, withLatestFromDb, cacheHistory, deleteHistory as clearCachedHistory } from "caching";
import { CurrentUserId$ } from "components/User/model/CurrentUser$";
import { prependPath } from "utils/redirect";


/* Histories */

const loadHistoryUrl = [
    "/api/histories?view=detailed",
    "keys=contents_active,hid_counter,non_ready_jobs",
    "q=purged&qv=False"
].join("&");

const userHistories$ = CurrentUserId$.pipe(
    mapTo(loadHistoryUrl),
    map(prependPath),
    switchMap(ajax.getJSON),
    split()
);

export const updateHistory = createInputFunction();
export const deleteHistory = createInputFunction();

const add$ = merge(userHistories$, updateHistory.$).pipe(cacheHistory());
const subtract$ = deleteHistory.$.pipe(clearCachedHistory());

const liveHistoryQueryForUser = () => pipe(
    withLatestFromDb(hColl$),
    switchMap(([id, coll]) => coll.find().where("user_id").eq(id).$),
    startWith([])
)

export const Histories$ = merge(add$, subtract$).pipe(
    switchMapTo(CurrentUserId$),
    liveHistoryQueryForUser(),
    share()
)


/* Current History */

const currentHistoryUrl = "/history/current_history_json";

const loadedCurrentHistoryId$ = CurrentUserId$.pipe(
    mapTo(currentHistoryUrl),
    map(prependPath),
    switchMap(ajax.getJSON),
    pluck('id')
)

export const setCurrentHistoryId = createInputFunction()

export const CurrentHistoryId$ = merge(loadedCurrentHistoryId$, setCurrentHistoryId.$).pipe(
    filter(Boolean),
    share()
)

export const CurrentHistory$ = CurrentHistoryId$.pipe(
    withLatestFrom(Histories$),
    map(([id, histories]) => histories.find(h => h.id == id)),
    filter(Boolean),
    startWith(null)
)




/* Updates to History server data */

export const historyUpdate = (debug) => pipe(
    map(buildHistoryUrl(debug)),
    map(prependPath),
    mergeMap(ajax.getJSON),
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
