import { merge, from } from "rxjs";
import { withLatestFrom, reduce, pluck, filter, map, tap, mergeMap, share } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { db$ } from "../db";
import { Manifest$ } from "./Manifest$";
import { SearchParams } from "../SearchParams";
import { log } from "../utils";

import { conformToSchema, datasetSchema, datasetCollectionSchema } from "../schema";


export function doUpdates([ history, params = new SearchParams() ]) {

    // Request and cache a list of the contents for this history/params
    const manifest$ = Manifest$(history, params);

    // get a list of the stuff on the manifest that needs and update
    const staleContent$ = getStaleContent(manifest$);

    // collect those ids for a bulk query
    const staleIdList$ = staleContent$.pipe(
        filter(Boolean),
        pluck('id'),
        reduce((list, id) => ([ ...list, id ]), [])
    );

    // do an ajax request for all the stale content in bulk
    const update$ = staleIdList$.pipe(
        filter(ids => ids.length),
        map(buildUpdateUrl(history)),
        mergeMap(ajax.getJSON),
        mergeMap(from), // split again for separate cachig
        share()
    );

    // cache the datasets
    const scrubDataset = conformToSchema(datasetSchema);
    const dataset$ = db$.pipe(pluck('collections','dataset'));
    const dsUpdate$ = update$.pipe(
        filter(o => o.history_content_type == "dataset"),
        map(scrubDataset),
        withLatestFrom(dataset$),
        mergeMap(cacheItem)
    );
    
    // cache the collections
    const scrubDatasetCollection = conformToSchema(datasetCollectionSchema);
    const datasetCollection$ = db$.pipe(pluck('collections','datasetcollection'));
    const dscUpdate$ = update$.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        map(raw => {
            // for whatever reason (incompetence), the api delivers no update_time
            let dsc = scrubDatasetCollection(raw);
            if (!dsc.update_time) {
                dsc.update_time = (new Date()).toISOString();
            }
            return dsc;
        }),
        withLatestFrom(datasetCollection$),
        mergeMap(cacheItem)
    );
    
    merge(dsUpdate$, dscUpdate$).subscribe(
        result => null,
        error => console.log("doUpdates error", error),
        () => console.log("doUpdates complete")
    );
}


function getStaleContent(m$) {

    // check the listed datasets and collections and start
    // eagerly loading those into the database

    const manifest$ = m$.pipe(share());
    const dataset$ = db$.pipe(pluck('collections','dataset'));
    let datasetCollection$ = db$.pipe(pluck('collections','datasetcollection'));

    const ds$ = manifest$.pipe(
        filter(o => o.history_content_type == "dataset"),
        withLatestFrom(dataset$),
        mergeMap(cacheCheck)
    );

    let dsc$ = manifest$.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        withLatestFrom(datasetCollection$),
        mergeMap(cacheCheck)
    );

    return merge(ds$, dsc$);
}

// Check cache for valid version of indicated item
// if no valid version, then return the stale id so the
// bulk update can request the new version
function cacheCheck([ manifestItem, collection ]) {

    let newVersionDate = Date.parse(manifestItem.update_time);

    // If valid version exists, and it was saved after
    // the manifestItem then we have a valid cache
    let promise = collection.findOne(manifestItem.id).exec()
        .then(existing => {
            if (existing) {
                let existingDate = Date.parse(existing.update_time);
                if (existingDate >= newVersionDate) {
                    return null;
                }
            }
            return manifestItem;
        });

    return from(promise);
}

function buildUpdateUrl(history) {
    return (ids = []) => {
        let idList = ids.join(",");
        return `/api/histories/${history.id}/contents?ids=${idList}`;
    }
}

function cacheItem([ item, collection ]) {
    let p = collection.atomicUpsert(item)
        .catch(err => console.log("upsert error", err))
    return from(p);
}
