import { of } from "rxjs/index";
import { mergeMap, share } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { historyContent$ } from "../db";
import { split, withLatestFromDb } from "./utils";


export function Manifest$(history, params) {
    return of(buildUrl(history, params)).pipe(
        mergeMap(loadManifest),
        split(),
        withLatestFromDb(historyContent$),
        mergeMap(cacheManifestItem),
        share()
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

export async function cacheManifestItem([ manifestItem, collection ]) {
    let existing = await collection.findOne(manifestItem.id).exec();
    if (existing) {
        let newVersionDate = Date.parse(manifestItem.update_time);
        let existingDate = Date.parse(existing.update_time);
        if (existingDate >= newVersionDate) {
            return existing;
        }
    }
    return await collection.upsert(manifestItem);
}
