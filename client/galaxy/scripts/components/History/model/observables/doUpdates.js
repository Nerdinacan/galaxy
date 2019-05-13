import { merge } from "rxjs";
import { reduce, pluck, filter, map, mergeMap, share } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { split, withLatestFromDb, log } from "./utils";
import { dataset$, datasetCollection$ } from "../db";
import { Manifest$ } from "./Manifest$";
import { conformToSchema, datasetSchema, datasetCollectionSchema } from "../schema";


export function doUpdates(counter, history, params) {

    // Request and cache a list of the contents for this history/params
    const manifest$ = Manifest$(history, params, counter);

    // get a list of the stuff on the manifest that needs an update
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
        split(),
        share()
    );

    // cache the datasets
    const dsUpdate$ = update$.pipe(
        filter(o => o.history_content_type == "dataset"),
        map(conformToSchema(datasetSchema)),
        withLatestFromDb(dataset$),
        mergeMap(cacheItem)
    );
    
    // cache the collections
    const dscUpdate$ = update$.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        map(prepareDatasetCollection),
        withLatestFromDb(datasetCollection$),
        mergeMap(cacheItem)
    );

    return merge(dsUpdate$, dscUpdate$).subscribe(
        result => console.log("doUpdates result", counter, result),
        err => console.warn("doUpdates err", counter, err),
        () => console.log("do updates complete", counter)
    );
}


// check the listed datasets and collections and start
// eagerly loading those into the database
function getStaleContent(manifest$) {

    const ds$ = manifest$.pipe(
        filter(o => o.history_content_type == "dataset"),
        withLatestFromDb(dataset$),
        mergeMap(cacheCheck)
    );

    const dsc$ = manifest$.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        withLatestFromDb(datasetCollection$),
        mergeMap(cacheCheck)
    );

    return merge(ds$, dsc$);
}


// Check cache for valid version of indicated item
// if no valid version, then return the stale id so the
// bulk update can request the new version
async function cacheCheck([ manifestItem, collection ]) {

    const newVersionDate = Date.parse(manifestItem.update_time);

    // If valid version exists, and it was saved after
    // the manifestItem then we have a valid cache
    const existing = await collection.findOne(manifestItem.id).exec();
    if (existing) {
        const existingDate = Date.parse(existing.update_time);
        if (existingDate >= newVersionDate) {
            return null;
        }
    }

    return manifestItem;
}

function buildUpdateUrl(history) {
    return (ids = []) => {
        const idList = ids.join(",");
        return `/api/histories/${history.id}/contents?ids=${idList}`;
    }
}

async function cacheItem([ item, collection ]) {
    const result = await collection.upsert(item);
    console.log("cacheItem", item, result);
    return result;
}


// for whatever reason, the api delivers no update_time for collections

const scrubDatasetCollection = conformToSchema(datasetCollectionSchema);

function prepareDatasetCollection(raw) {
    const dsc = scrubDatasetCollection(raw);
    if (!dsc.update_time) {
        dsc.update_time = (new Date()).toISOString();
    }
    return dsc;
}
