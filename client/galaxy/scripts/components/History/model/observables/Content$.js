import { combineLatest } from "rxjs";
import { tap, map, switchMap } from "rxjs/operators";
import { historyContent$ } from "../db";
import { withLatestFromDb } from "./CachedData";


export const localContentQuery = () => param$ => {
    return param$.pipe(
        withLatestFromDb(historyContent$),
        switchMap(buildContentQuery)
    );
}


const buildContentQuery = ([ params, coll ]) => {

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

    return query.$;
}
