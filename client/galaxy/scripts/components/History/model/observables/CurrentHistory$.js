import { defer, merge } from "rxjs";
import { map, mergeMap, mergeMapTo, filter, share, pluck } from "rxjs/operators";
import { getCurrentHistory, selectCurrentHistory } from "../queries";
import { HistoryList$ } from "./HistoryList$";
import { firstItem, createInputFunction } from "./utils";


// History validator
const historyValid = h => !h.deleted;

// Initial load during application init
const load$ = defer(getCurrentHistory).pipe(
    share()
);

// if that one is ok, use it
const initLookup$ = load$.pipe(
    filter(historyValid)
);

// Find first in loaded history list
const first$ = load$.pipe(
    filter(h => !historyValid(h)),
    mergeMapTo(HistoryList$),
    map(list => list.filter(historyValid)),
    firstItem(),
    pluck("id"),
    mergeMap(selectCurrentHistory)
);

// Somebody explicitly changed the history
export const setCurrentHistoryId = createInputFunction();
const manual$ = setCurrentHistoryId.$.pipe(
    mergeMap(selectCurrentHistory)
);

// Initial lookup, first in valid list, or manual selection
export const CurrentHistory$ = merge(initLookup$, first$, manual$);
