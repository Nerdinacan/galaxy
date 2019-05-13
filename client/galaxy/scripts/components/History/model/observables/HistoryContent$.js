import { combineLatest } from "rxjs";
import { map, switchMap, share } from "rxjs/operators";
import { historyContent$ } from "../db";


export function HistoryContent$(history$, param$) {
    return combineLatest(history$, param$, historyContent$).pipe(
        switchMap(buildContentObservable),
        map(scrubDocs),
        share()
    );
}

// Return an observable that emits results of the query
// TODO: apply params object to the query characteristics
function buildContentObservable([ history, params, coll ]) {
    const query = coll.find()
        .where('history_id').eq(history.id)
        .skip(params.offset)
        .limit(params.pageSize)
        .sort("hid");
    return query.$;
}

// Turns array of RxDB docs into plain objects
function scrubDocs(results) {
    return results.map(o => o.toJSON())
}
