import { of, merge, pipe } from "rxjs";
import { tap, map, filter, mapTo, switchMap, switchMapTo,
    share, pluck, withLatestFrom, mergeMap } from "rxjs/operators";
import { createInputFunction, split, ajaxGet } from "utils/observable";
import { history$ as hColl$, withLatestFromDb, cacheHistory,
    deleteHistory as clearCachedHistory } from "caching";
import { CurrentUserId$ } from "components/User/model/CurrentUser$";
import { selectCurrentHistory, createHistory } from "./queries";


/* Histories */

const loadHistoryUrl = [
    "/api/histories?view=detailed",
    "keys=contents_active,hid_counter,non_ready_jobs",
    "q=purged&qv=False"
].join("&");

const userHistories$ = CurrentUserId$.pipe(
    mapTo(loadHistoryUrl),
    ajaxGet(),
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
    map(docs => docs.map(d => d.toJSON())),
    share()
);



/* Current History */

const currentHistoryUrl = "/history/current_history_json";

const loadedCurrentHistoryId$ = CurrentUserId$.pipe(
    mapTo(currentHistoryUrl),
    ajaxGet(),
    pluck("id")
);

export const setCurrentHistoryId = createInputFunction();

// save current history back to server for reasons unknown
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
