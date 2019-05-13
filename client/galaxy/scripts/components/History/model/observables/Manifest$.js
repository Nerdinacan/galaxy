import { of, combineLatest } from "rxjs";
import { map, mergeMap, share, switchMap, distinctUntilChanged } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { historyContent$ } from "../db";
import { split, log } from "./utils";

export function Manifest$(history, params, counter) {

    const history$ = of(history);
    const param$ = of(params);
    const counter$ = of(counter);

    // get most recent update_time from the local database
    const updateTime$ = combineLatest(history$, param$, historyContent$).pipe(
        switchMap(mostRecentUpdate)
    );

    // do manifest request
    const manifestItem$ = combineLatest(history$, param$, counter$, updateTime$).pipe(
        map(buildUrl),
        mergeMap(loadManifest),
        split()
    );

    // cache manifestItem in database
    return combineLatest(manifestItem$, historyContent$).pipe(
        mergeMap(cacheManifestItem),
        share()
    );
}


// returns a javascript date object representing the maximum update_time
// in the cached contents for the indicated history
const getMax = maxDocDate('update_time');
export async function mostRecentUpdate([ history, params, collection ]) {
    const results = await collection.find().where('history_id').eq(history.id).exec();
    return getMax(results);
}

// finds maximum date in an array of docs
function maxDocDate(dateField) {
    return results => {
        return results.reduce((max, doc) => {
            const d = new Date(doc[dateField]);
            return d > max ? d : max;
        }, new Date(0));
    }
}


// just using a regular contents query with minimal fields
// TODO: make a very fast manifest endpoint since we'll be checking this a lot?
export function buildUrl([ history, params, counter, since ]) {

    const base = `/api/histories/${history.id}/contents?v=dev`;

    // minimal manifest item fields
    const keys = "keys=id,hid,history_id,history_content_type,name,type_id,url,update_time";

    // pagination
    const limit = `limit=${params.pageSize}`;
    const offset = `offset=${params.offset}`;

    // only look for updates since the latest update_time from the cache
    // but only if thie params have not changed. When the params change,
    // the counter will be -1
    let dateCriteria = "";
    if (counter != -1) {
        // using the borderline-criminal q/qv syntax that was implemented in
        // the api for mysterious reasons that I can only assume resulted in
        // somebody getting fired.
        dateCriteria = (since !== null) ? `q=update_time-ge&qv=${since.toISOString()}` : "";
    }

    // console.group("buildUrl", counter);
    // console.log(limit);
    // console.log(offset);
    // console.log("dateCriteria", dateCriteria);
    // console.groupEnd();
    
    return [ base, keys, limit, offset, dateCriteria ].filter(o => o.length).join("&");
}


export function loadManifest(url) {
    return ajax.getJSON(url);
}


export async function cacheManifestItem([ manifestItem, collection ]) {
    const existing = await collection.findOne(manifestItem.id).exec();
    if (existing) {
        const newVersionDate = Date.parse(manifestItem.update_time);
        const existingDate = Date.parse(existing.update_time);
        if (existingDate >= newVersionDate) {
            return existing;
        }
    }
    return await collection.upsert(manifestItem);
}
