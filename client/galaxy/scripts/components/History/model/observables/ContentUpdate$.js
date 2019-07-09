import { merge } from "rxjs";
import { tap, pluck, reduce, filter, mergeMap, withLatestFrom, map, share } from "rxjs/operators";
import { log, load, split } from "./utils";
import { cacheDataset, cacheDatasetCollection } from "./CachedData";
import { dataset$, datasetCollection$ } from "../db";


export function ContentUpdate$(manifest$, history$) {

    // Determine which of the content items need to be updated
    // only keep the ids for the stale content entries, do
    // a bulk content request for those ids.

    const staleIds$ = manifest$.pipe(
        collectStaleIds(),
        filter(ids => ids.length)
    );


    // Retrieved detailed lookups for stale cotent

    const details$ = staleIds$.pipe(
        withLatestFrom(history$),
        map(buildBulkContentUrl),
        load(),
        split(),
        share()
    );

    const cacheDS$ = details$.pipe(
        filter(o => o.history_content_type == "dataset"),
        cacheDataset()
    );

    const cacheDSC$ = details$.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        cacheDatasetCollection()
    );

    return merge(cacheDS$, cacheDSC$);
}


// retrieve details by an explicit list of ids

function buildBulkContentUrl([ ids, history ]) {
    const idList = ids.join(",");
    return `/api/histories/${history.id}/contents?ids=${idList}`;
}


// collect stale ids from manifest query

const collectStaleIds = () => manifest$ => {

    const sharedManifest$ = manifest$.pipe(
        share()
    );

    const ds$ = sharedManifest$.pipe(
        filter(o => o.history_content_type == "dataset"),
        withLatestFrom(dataset$),
        mergeMap(filterStaleContent)
    );

    const dsc$ = sharedManifest$.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        withLatestFrom(datasetCollection$),
        mergeMap(filterStaleContent)
    );

    // if this never completes, reduce won't work
    return merge(ds$, dsc$).pipe(
        filter(Boolean),
        pluck('id'),
        reduce((list, id) => ([ ...list, id ]), [])
    );
}


// Check database for valid version of indicated item
// if no valid version, then return the stale id so the
// bulk update can request the new version

async function filterStaleContent([ item, collection ]) {

    const newVersionDate = Date.parse(item.update_time);

    // If valid version exists, and it was saved after
    // the manifestItem then we have a valid cache
    const existing = await collection.findOne(item.id).exec();
    if (existing) {
        const existingDate = Date.parse(existing.update_time);
        if (existingDate >= newVersionDate) {
            return null;
        }
    }

    // returning a summary item means this item is stale
    return item;
}
