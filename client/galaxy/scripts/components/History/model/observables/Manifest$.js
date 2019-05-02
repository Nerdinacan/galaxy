import { of, from } from "rxjs";
import { pluck, tap, withLatestFrom, mergeMap, concatMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { db$ } from "../db";
import { log } from "../utils";

const historyContent$ = db$.pipe(
    pluck('historyContent')
);

export function Manifest$(history, params) {

    return of(buildUrl(history, params)).pipe(
        mergeMap(loadManifest),
        mergeMap(o => from(o)), // split
        withLatestFrom(historyContent$),
        concatMap(cacheManifestItem),
    );
}

function buildUrl(history, params) {
    let baseUrl = history.contents_url;
    let url = `${baseUrl}?v=dev&keys=id,hid,history_id,history_content_type,url,update_time`;
    return url;
}

export function loadManifest(url) {
    return ajax.getJSON(url);
}

export function cacheManifestItem([ item, collection ]) {
    // console.log("cacheManifestItem", item.id, collection);
    return from(collection.upsert(item));
}