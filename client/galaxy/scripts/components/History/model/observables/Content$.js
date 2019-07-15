import { tap, map, switchMap } from "rxjs/operators";
import { historyContent$ } from "../db";
import { withLatestFromDb } from "./CachedData";


export const localContentObservable = (label, debug = false) => param$ => {
    return param$.pipe(
        tap(params => {
            console.log("viewable params changed", params);
        }),
        localContentQuery(label, debug),
        switchMap(query => query.$)
    );
}

export const localContentQuery = (label, debug) => param$ => {
    return param$.pipe(
        withLatestFromDb(historyContent$),
        map(buildContentQuery(label, debug))
    );
}

const buildContentQuery = (label, debug = false) => ([ params, coll ]) => {

    let query = coll.find().where("history_id").eq(params.historyId);
    
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

    if (debug) {
        console.groupCollapsed("buildContentQuery", label);
        params.report(label);
        console.log("query", query.mquery);
        console.log(query.stringRep);
        console.groupEnd();
    }

    return query;
}
