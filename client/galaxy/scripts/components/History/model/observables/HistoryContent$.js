import { combineLatest } from "rxjs/index";
import { map, tap, switchMap, share, mergeMap } from "rxjs/operators";
import { historyContent$ } from "../db";
import { doUpdates } from "./doUpdates";


export function HistoryContent$(history$, param$) {
    return combineLatest(history$, param$).pipe(
        tap(doUpdates),
        mergeMap(buildContentObservable),
        map(scrubDocs),
        share()
    );
}

// Return an observable that emits results of the query
function buildContentObservable([ history, params ]) {
    return historyContent$.pipe(
        switchMap(coll => {
            // TODO: apply params object to the query characteristics
            let query = coll.find().where('history_id').eq(history.id);
            return query.$;
        })
    );
}

// turns array of rxdb docs into plain objects
// TODO: do this in component?
function scrubDocs(results) {
    return results.map(o => o.toJSON())
}
