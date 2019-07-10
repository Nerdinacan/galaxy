/**
 * Maintains a local list of available histories. The vuex store subscribes to
 * this observable to keep updated.... thus illustrating the uselessness of the
 * vuex store.
 */

import { merge, concat } from "rxjs";
import { tap, map, mergeMap, filter, share, 
    pluck, take, withLatestFrom } from "rxjs/operators";
import { getCurrentHistory, selectCurrentHistory } from "../queries";
import { HistoryList$ } from "./HistoryList$";
import { split, firstItem, createInputFunction } from "./utils";
import { CurrentUserId$ } from "components/User/model/CurrentUser$";


// Initial load

const historyValid = h => !h.deleted;
const validHistories$ = HistoryList$.pipe(
    split(),
    filter(historyValid)
);


// Get what the server thinks the current history is
// TODO: remove server's role in maintaining this variable

const ServerCurrentHistoryId$ = CurrentUserId$.pipe(
    mergeMap(getCurrentHistory),
    pluck('id')
);

const loadCurrentHistory$ = validHistories$.pipe(
    withLatestFrom(ServerCurrentHistoryId$),
    filter(([ doc, id ]) => doc.id == id),
    firstItem(), // don't want the id
    take(1)
);


// If the server returned a deleted history or something like that
// take the first valid history from the list of available ones

const firstValidHistory$ = validHistories$.pipe(
    take(1),
    tap(history => selectCurrentHistory(history.id))
);


// This is the history we start with

const initialValue$ = concat(loadCurrentHistory$, firstValidHistory$).pipe(
    take(1),
    share()
);


// User explicitly changes the history id

export const setCurrentHistoryId = createInputFunction();

const manualSelection$ = setCurrentHistoryId.$.pipe(
    withLatestFrom(HistoryList$),
    map(([ id, list ]) => list.find(h => h.id == id)),
    tap(history => selectCurrentHistory(history.id))
);


// Final observables for the current history

export const CurrentHistory$ = merge(initialValue$, manualSelection$).pipe(
    share()
);

export const CurrentHistoryId$ = CurrentHistory$.pipe(pluck('id'));