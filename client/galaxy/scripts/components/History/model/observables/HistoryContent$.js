import { combineLatest } from "rxjs/index";
import { map, tap, switchMap, share } from "rxjs/operators";
import { historyContent$ } from "../db";
import { doUpdates } from "./doUpdates";


export function HistoryContent$(history$, param$) {
    return combineLatest(history$, param$, historyContent$).pipe(
        tap(doUpdates),
        switchMap(buildContentObservable),
        map(scrubDocs),
        share()
    );
}

// Return an observable that emits results of the query
// TODO: apply params object to the query characteristics
function buildContentObservable([ history, params, coll ]) {
    return coll.find().where('history_id').eq(history.id).$;
}

// Turns array of RxDB docs into plain objects
function scrubDocs(results) {
    return results.map(o => o.toJSON())
}
