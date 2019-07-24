import { of, merge, pipe } from "rxjs";
import { ajax } from "rxjs/ajax";
import { tap, map, filter, mapTo, switchMap, switchMapTo, concatMap,
    share, pluck, withLatestFrom, mergeMap } from "rxjs/operators";
import { createInputFunction, split, firstItem } from "utils/observable";
import { history$ as hColl$, withLatestFromDb, cacheHistory,
    deleteHistory as clearCachedHistory } from "caching";
import { CurrentUserId$ } from "components/User/model/CurrentUser$";
import { selectCurrentHistory, createHistory } from "./queries";
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

export const updateHistoryList = createInputFunction();
export const deleteHistoryFromList = createInputFunction();

const add$ = merge(userHistories$, updateHistoryList.$).pipe(cacheHistory());
const subtract$ = deleteHistoryFromList.$.pipe(clearCachedHistory());

const liveHistoryQueryForUser = () => pipe(
    withLatestFromDb(hColl$),
    switchMap(([id, coll]) => coll.find().where("user_id").eq(id).$)
);

export const Histories$ = merge(add$, subtract$).pipe(
    switchMapTo(CurrentUserId$),
    liveHistoryQueryForUser(),
    share()
);



/* Current History */

const currentHistoryUrl = "/history/current_history_json";

const loadedCurrentHistoryId$ = CurrentUserId$.pipe(
    mapTo(currentHistoryUrl),
    map(prependPath),
    switchMap(ajax.getJSON),
    pluck("id")
);

export const setCurrentHistoryId = createInputFunction();

// save for server for reasons unknown
const manualCurrentHistoryId = setCurrentHistoryId.$.pipe(
    mergeMap(selectCurrentHistory),
    pluck("id")
);


export const CurrentHistoryId$ = merge(loadedCurrentHistoryId$, manualCurrentHistoryId).pipe(
    filter(Boolean),
    share()
);


export const CurrentHistory$ = CurrentHistoryId$.pipe(
    withLatestFrom(Histories$),
    mergeMap(async ([id, histories]) => {
        let h = histories.find(h => h.id == id);
        if (!h && histories.length) {
            h = histories[0];
        } else {
            h = null;
        }
        return of(h);
    }),
    tap(async history => {
        // create new if nothing
        if (!history) {
            const newHistory = await createHistory();
            setCurrentHistoryId(newHistory.id);
        }
    }),
    filter(Boolean)
);


/* Updates to History server data */

export const historyUpdate = debug => pipe(
    tap(h => {
        if (debug) {
            console.log("historyUpdate", h);
        }
    }),
    map(buildHistoryUrl(debug)),
    map(prependPath),
    concatMap(ajax.getJSON),
    tap(results => {
        if (debug) {
            console.log("historyUpdate retrieved results", results.length);
        }
    }),
    firstItem(),
    tap(h => {
        if (debug) {
            console.log("historyUpdate retrieved history", h);
        }
    }),
    cacheHistory(debug),
    tap(h => {
        if (debug) {
            console.log("historyUpdate cached history", h);
        }
    })
)


// Requests a history with same id but newer update time. Triggers on
// server should update the history so this will show up with no results
// unless something's been updated.

const buildHistoryUrl = debug => history => {
    const base = "/api/histories?view=detailed&keys=size,non_ready_jobs,contents_active,hid_counter";
    const idCriteria = `q=encoded_id-in&qv=${history.id}`;
    const updateCriteria = `q=update_time-gt&qv=${history.update_time}`;
    const parts = [base, idCriteria, updateCriteria];
    const url = parts.filter(o => o.length).join("&");
    if (debug) {
        console.groupCollapsed("buildHistoryUrl");
        console.log("history", history);
        console.groupEnd();
    }
    return url;
}
