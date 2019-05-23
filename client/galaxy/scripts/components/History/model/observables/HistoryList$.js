import { defer, Subject, merge, of, combineLatest } from "rxjs";
import { tap, map, mapTo, debounceTime, mergeMap, withLatestFrom, filter }
    from "rxjs/operators";
import { scanToMap, split, load, cacheInLocalDb, deleteFromLocalDb, firstItem } from "./utils";
import { CurrentUser$ } from "components/User/model/CurrentUser$";
import { history$ } from "../db";
import { prepareHistory } from "../schema/prepare";


// every time the user changes we load new histories
const listingUrl = "/api/histories?view=dev-detailed&keys=contents_active";
const loadHistories$ = CurrentUser$.pipe(
    mapTo(listingUrl),
    load(),
    split()
)

// Change queues
const updates$ = new Subject();
const add$ = merge(loadHistories$, updates$).pipe(
    map(prepareHistory),
    cacheInLocalDb(history$),
    map(item => ({ item, operation: "set" }))
)
const deletes$ = new Subject();
const subtract$ = deletes$.pipe(
    deleteFromLocalDb(history$),
    map(item => ({ item, operation: "delete" }))
)

// Returns a map of history.id => history object, filtered to histories
// available to currently logged in user
const currentHistoryMap$ = merge(add$, subtract$).pipe(
    withLatestFrom(CurrentUser$),
    filter(([ { item }, user ]) => item.user_id === user.id),
    firstItem(),
    scanToMap("id")
);

// functions to modify the stored list of history
export const updateHistory = newHistory => updates$.next(newHistory);
export const deleteHistory = doomedHistory => deletes$.next(doomedHistory);


export const HistoryList$ = currentHistoryMap$.pipe(
    withLatestFrom(CurrentUser$, history$),
    mergeMap(([ _, user, coll ]) => coll.find().where('user_id').eq(user.id).$),
    map(docs => docs.map(h => h.toJSON())),
    debounceTime(100)
)
