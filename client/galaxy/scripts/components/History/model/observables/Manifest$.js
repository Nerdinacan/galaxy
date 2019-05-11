import { of, from } from "rxjs";
import { withLatestFrom, mergeMap, concatMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { historyContent$ } from "../db";

export function Manifest$(history, params) {
    return of(buildUrl(history, params)).pipe(
        mergeMap(loadManifest),
        mergeMap(from), // split
        withLatestFrom(historyContent$),
        concatMap(cacheManifestItem),
    );
}

// just using a regular contents query with minimal fields for now
// TODO: make a very fast manifest endpoint since we'll be checking this a lot?
export function buildUrl(history, params) {
    return `/api/histories/${history.id}/contents?v=dev&keys=id,hid,history_id,history_content_type,url,update_time`;
}

export function loadManifest(url) {
    return ajax.getJSON(url);
}

export function cacheManifestItem([ item, collection ]) {
    return from(collection.upsert(item));
}