// Retrieves history content summary objects for given history/params, 
// designed to work in the polling process.

import { of, combineLatest } from "rxjs";
import { map, withLatestFrom, share } from "rxjs/operators";
import { history$ as historyCollection$, historyContent$ } from "../db";
import { prepareHistory, prepareManifestItem } from "../schema";
import { load, split, cacheInLocalDb, firstItem } from "./utils";
import capitalize from "underscore.string/capitalize";
import { CachedItem } from "./CachedData";


export function Manifest$(history, params, counter) {

    const history$ = of(history);
    const param$ = of(params);
    const counter$ = of(counter);
    const since$ = lastHistoryUpdateTime$(history.id).pipe(share());

    // check to see if this history has been updated, 
    const historyUpdate$ = combineLatest(history$, since$, counter$).pipe(
        map(buildHistoryUpdateUrl),
        load(),
        firstItem(),
        map(prepareHistory),
        cacheInLocalDb(historyCollection$)
    );
    
    // if we get this far, do a contents request, this is
    // a list of all the content matching the indicated
    // parameters that have changed sinde the since$ date
    // Cache results
    const contentUpdate$ = historyUpdate$.pipe(
        withLatestFrom(param$, since$, counter$),
        map(buildContentsUrl),
        load(),
        split(),
        map(prepareManifestItem),
        cacheInLocalDb(historyContent$)
    );

    return contentUpdate$;
}



// Last update time for a history, from cache or default

const dateZero = (new Date(0)).toISOString();
const historyLookup = CachedItem(historyCollection$, "id", false);

function lastHistoryUpdateTime$(id) {
    return historyLookup(id).pipe(
        map(doc => doc ? doc.update_time : dateZero),
    );
}

function buildHistoryUpdateUrl([ history, since, counter ]) {
    const base = "/api/histories?view=detailed&keys=contents_active";
    const idCriteria = `q=encoded_id-in&qv=${history.id}`;
    const updateCriteria = (counter != -1) ? `q=update_time-gt&qv=${since}` : "";
    const parts = [ base, updateCriteria, idCriteria ];
    return parts.filter(o => o.length).join("&");
}

// just using a regular contents query with minimal fields
// TODO: make a very fast manifest endpoint since we'll be checking this a lot?
function buildContentsUrl([ history, params, since, counter ]) {

    const base = `/api/histories/${history.id}/contents?v=dev&view=summary`;

    // pagination
    const limit = `limit=${params.pageSize}`;
    const offset = `offset=${params.offset}`;

    // deleted, purged, visible, mysteriously don't take normal true/false vals
    const deleteFilter = "q=deleted&qv=" + capitalize(String(params.showDeleted));
    const purgeFilter = "q=purged&qv=" + capitalize(String(params.showPurged));
    const visibleFilter = "q=visible&qv=" + capitalize(String(params.showVisible));

    // text filter
    const textFilter = (params.filterText.length) 
        ? `q=name-contains&qv=${params.filterText}` 
        : "";

    // only look for updates since the latest update_time from the cache
    // but only if thie params have not changed. When the params change,
    // the counter will be -1 and we want to reset the "since"
    const updateCriteria = (counter != -1) 
        ? `q=update_time-gt&qv=${since}` 
        : "";

    return [
        base, limit, offset, textFilter, 
        deleteFilter, purgeFilter, visibleFilter, 
        updateCriteria 
    ].filter(o => o.length).join("&");
}
