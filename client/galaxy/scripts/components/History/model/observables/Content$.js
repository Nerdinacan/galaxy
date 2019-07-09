import { combineLatest } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { historyContent$ } from "../db";

/**
 * Returns an observable content query that emits content whenever
 * indexDb is updated, or the searchParams or history changes.
 * @param {observable} history$ History observable
 * @param {observable} param$ SearchParam observable
 */
export const Content$ = (history$, param$) => {
    return combineLatest(history$, param$, historyContent$).pipe(
        switchMap(buildContentObservable),
        map(docs => docs.map(d => d.toJSON()))
    );
}

const buildContentObservable = ([ history, params, coll ]) => {

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

    // We always show everything we have locally
    // offset/limit are just for limiting the server queries
    // to the region we're looking at
    // query = query.skip(params.offset)
    //     .limit(params.limit)
    //     .sort("-hid");

    query = query.sort("-hid");

    return query.$;
}
