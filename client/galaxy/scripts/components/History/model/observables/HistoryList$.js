import { merge, combineLatest } from "rxjs";
import { map, mapTo, mergeMap, mergeMapTo, share, shareReplay, 
    withLatestFrom, distinctUntilChanged, throttleTime } from "rxjs/operators";
import { log, warn, split, load, createInputFunction } from "./utils";
import { cacheHistory, deleteHistory as deleteCachedHistory } from "./CachedData";
import { CurrentUserId$ } from "components/User/model/CurrentUser$";
import { history$ } from "../db";


// every time the user changes we load new histories

const listingUrl = "/api/histories?view=dev-detailed&keys=visible,contents_active&q=purged&qv=False";

const loadHistories$ = CurrentUserId$.pipe(
    mapTo(listingUrl),
    load(),
    split()
);


// update queues, add/subtract history

export const updateHistory = createInputFunction();
export const deleteHistory = createInputFunction();

const add$ = merge(loadHistories$, updateHistory.$).pipe(
    cacheHistory()
);

const subtract$ = deleteHistory.$.pipe(
    deleteCachedHistory()
);

export const HistoryListChange$ = merge(add$, subtract$);



// Observable points at database, depends on current user

export const DbHistoryList$ = CurrentUserId$.pipe(
    withLatestFrom(history$),
    mergeMap(([ id, c ]) => {
        return c.find().where('user_id').eq(id).$;
    }),
    map(docs => docs.map(h => h.toJSON()))
);


// emits a lot because of the change subscription, we
// don't actually care about the value, only that the
// subscription is maintained

const trigger$ = HistoryListChange$.pipe(
    throttleTime(5000)
);


// Observable query that points at db

export const HistoryList$ = trigger$.pipe(
    mergeMapTo(DbHistoryList$),
    shareReplay(1)
);
