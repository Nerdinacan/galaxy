import { from, defer, merge, Subject } from "rxjs";
import { tap, map, mergeMap, mergeMapTo, filter, share, pluck } from "rxjs/operators";
import { getCurrentHistory, selectCurrentHistory } from "../queries";
import { HistoryList$ } from "./HistoryList$";
import { firstItem } from "./utils";


// History validator
const historyValid = h => !h.deleted;

// Initial load during application init
const load$ = defer(getCurrentHistory).pipe(
    // tap(history => console.log("loaded history", history)),
    share()
);

const initLookup$ = load$.pipe(
    filter(historyValid), 
    // tap(history => console.log("validated history", history)),
);

// Get first in history list
const first$ = load$.pipe(
    filter(h => !historyValid(h)),
    mergeMapTo(HistoryList$),
    map(list => list.filter(historyValid)),
    firstItem(),
    pluck("id"),
    mergeMap(selectCurrentHistory)
);

// Manual updates
const update$ = new Subject();
const manual$ = update$.pipe(mergeMap(selectCurrentHistory));
export const setCurrentHistoryId = id => update$.next(id);

// Initial lookup, first in valid list, or manual selection
export const CurrentHistory$ = merge(initLookup$, first$, manual$);
