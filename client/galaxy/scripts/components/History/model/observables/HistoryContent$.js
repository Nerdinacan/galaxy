import { combineLatest, isObservable, of, from } from "rxjs";
import { map, tap, switchMap, share, pluck } from "rxjs/operators";
import { db$ } from "../db";
import { SearchParams } from "../SearchParams";
import { doUpdates } from "./doUpdates";
import { log } from "../utils";


export function HistoryContent$(h, p = new SearchParams()) {

    let history$ = isObservable(h) ? h : of(h);
    let param$ = isObservable(p) ? p : of(p);

    // Actual return value has nothing to do with any of that stuff above, we
    // look at indexDB directly using rxdb
    return combineLatest(history$, param$).pipe(
        tap(doUpdates),
        switchMap(buildContentObservable),
        map(scrubDocs),
        share()
    );
}

// Return an observable that emits results of the query
function buildContentObservable([ history, params ]) {
    return db$.pipe(
        pluck('historyContent'),
        switchMap(collection => {
            let query = collection.find().where('history_id').eq(history.id);
            return query.$;
        })
    );
}

// turns array of rxdb docs into plain objects
// TODO: do this in component?
function scrubDocs(results) {
    return results.map(o => o.toJSON())
}
