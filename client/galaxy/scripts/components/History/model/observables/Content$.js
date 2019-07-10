import { combineLatest } from "rxjs";
import { tap, map, switchMap } from "rxjs/operators";
import { historyContent$ } from "../db";
import { withLatestFromDb } from "./CachedData";


/**
 * Returns an observable content query that emits content whenever
 * indexDb is updated, or the searchParams or history changes.
 * @param {observable} history$ History observable
 * @param {observable} param$ SearchParam observable
 */
export const Content$ = (history$, param$) => {
    return combineLatest(history$, param$).pipe(
        withLatestFromDb(historyContent$), // rxdb objects a little buggy
        switchMap(buildContentObservable),
        map(docs => docs.map(d => d.toJSON()))
    );
}


const buildContentObservable = ([ [ history, params ], coll ]) => {

    let query = coll.find().where("history_id").eq(history.id);

    if (params.showDeleted === false) {
        query = query.where("isDeleted").eq(false);
        query = query.where("purged").eq(false);
    }

    if (params.showHidden === false) {
        query = query.where('visible').eq(true);
    }

    if (params.filterText.length) {
        const filterRE = new RegExp(params.filterText, "gi");
        query = query.where("name").regex(filterRE);
    }

    query = query.sort("-hid");

    return query.$;
}
