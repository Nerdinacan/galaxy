import { combineLatest, isObservable, of, from } from "rxjs";
import { map, tap, switchMap, share, pluck, mergeMap } from "rxjs/operators";
import { db$ } from "../db";
import { SearchParams } from "../SearchParams";
import { doUpdates } from "./doUpdates";
import { log } from "../utils";

export function HistoryContent$(history$, param$) {
    return combineLatest(history$, param$).pipe(
        tap(log('combineLatest history, params')),
        tap(doUpdates),
        mergeMap(buildContentObservable),
        map(scrubDocs),
        share()
    );
}

// Return an observable that emits results of the query
function buildContentObservable([ history, params = new SearchParams() ]) {
    return db$.pipe(
        pluck('historyContent'),
        switchMap(collection => {
            return collection.find()
                .where('history_id').eq(history.id)
                .$;
        })
    );
}

// turns array of rxdb docs into plain objects
// TODO: do this in component?
function scrubDocs(results) {
    return results.map(o => o.toJSON())
}
