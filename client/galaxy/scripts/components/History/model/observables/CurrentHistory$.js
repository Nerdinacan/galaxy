// This logic is super-stupid because of the need to ask
// the server who the client thinks the current history is.

import { merge, concat } from "rxjs";
import { tap, map, mergeMap, filter, share, 
    pluck, take, withLatestFrom } from "rxjs/operators";
import { getCurrentHistory, selectCurrentHistory } from "../queries";
import { HistoryList$ } from "./HistoryList$";
import { split, firstItem, createInputFunction } from "./utils";
import { CurrentUserId$ } from "components/User/model/CurrentUser$";


// Initial load during application init, returns a uselessly-formed
// history object, but we have to look through it for the id

const historyValid = h => !h.deleted;
const validHistories$ = HistoryList$.pipe(
    split(),
    filter(historyValid),
    share()
);

const firstValidHistory$ = validHistories$.pipe(
    take(1),
    tap(history => selectCurrentHistory(history.id))
);

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


// Initial lookup, or first non-deleted history in the list

const initialValue$ = concat(loadCurrentHistory$, firstValidHistory$).pipe(
    take(1)
);


// Somebody explicitly changed the history

export const setCurrentHistoryId = createInputFunction();

const manualSelection$ = setCurrentHistoryId.$.pipe(
    withLatestFrom(HistoryList$),
    map(([ id, list ]) => {
        return list.find(h => h.id == id);
    }),
    tap(history => selectCurrentHistory(history.id))
);



// Publics

export const CurrentHistory$ = merge(initialValue$, manualSelection$);

export const CurrentHistoryId$ = CurrentHistory$.pipe(pluck('id'));