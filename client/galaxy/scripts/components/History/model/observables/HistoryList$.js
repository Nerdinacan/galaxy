import { merge, combineLatest } from "rxjs";
import { map, mapTo, debounceTime, mergeMap, mergeMapTo, share } from "rxjs/operators";
import { split, load, createInputFunction } from "./utils";
import { cacheHistory, deleteHistory as deleteCachedHistory } from "./CachedData";
import { CurrentUserId$ } from "components/User/model/CurrentUser$";
import { history$ } from "../db";
import { prepareHistory } from "../schema/prepare";


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


// List of histories available to current user

const dbHistoryList$ = combineLatest(CurrentUserId$, history$).pipe(
    mergeMap(([ id, c ]) => {
        return c.find().where('user_id').eq(id).$;
    }),
    map(docs => docs.map(h => h.toJSON()))
);

export const HistoryList$ = merge(CurrentUserId$, add$, subtract$).pipe(
    debounceTime(100),
    mergeMapTo(dbHistoryList$),
    share()
);
