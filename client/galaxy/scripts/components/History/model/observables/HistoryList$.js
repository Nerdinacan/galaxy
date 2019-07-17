import { merge } from "rxjs";
import { map, mapTo, switchMap, mergeMapTo, share, throttleTime } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { split, createInputFunction } from "utils/observable";
import { cacheHistory, deleteHistory as deleteCachedHistory, withLatestFromDb, 
    history$ as historyCollection$ } from "caching";
import { CurrentUserId$ } from "components/User/model/CurrentUser$";
import { prependPath } from "utils/redirect";


// every time the user changes we load new histories

const listingUrl = "/api/histories?view=detailed&keys=contents_active,hid_counter,non_ready_jobs&q=purged&qv=False";

const loadHistories$ = CurrentUserId$.pipe(
    mapTo(listingUrl),
    map(prependPath),
    switchMap(ajax.getJSON),
    split()
)


// update queues, add/subtract history

export const updateHistory = createInputFunction();
export const deleteHistory = createInputFunction();

const add$ = merge(loadHistories$, updateHistory.$).pipe(
    cacheHistory()
)

const subtract$ = deleteHistory.$.pipe(
    deleteCachedHistory()
)


// Observable query that points at db

const DbHistoryList$ = CurrentUserId$.pipe(
    withLatestFromDb(historyCollection$),
    switchMap(([ id, coll ]) => coll.find().where('user_id').eq(id).$),
    map(docs => docs.map(h => h.toJSON()))
)

const trigger$ = merge(add$, subtract$).pipe(
    throttleTime(5000)
)

export const HistoryList$ = trigger$.pipe(
    mergeMapTo(DbHistoryList$),
    share()
)
