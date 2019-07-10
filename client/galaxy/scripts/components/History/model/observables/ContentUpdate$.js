/**
 * Given a list of fresh server content (manifest$) corresponding to the current
 * history/params, this observable splits up the returned content into dataset
 * and datasetCollection segments and requests and caches a detailed view locally.
 */
import { merge } from "rxjs";
import { tap, pluck, reduce, filter, mergeMap, withLatestFrom, map, share } from "rxjs/operators";
import { ajaxGet, split } from "./utils";
import { cacheDataset, cacheDatasetCollection, withLatestFromDb } from "./CachedData";
import { dataset$, datasetCollection$ } from "../db";


export function ContentUpdate$(manifest$, history$) {

    // Determine which of the content items need to be updated
    // only keep the ids for the stale content entries, do
    // a bulk content request for those ids.

    const staleIds$ = manifest$.pipe(
        collectStaleIds(),
        tap(ids => console.log("stale ids", ids)),
        filter(ids => ids.length)
    );


    // Retrieved detailed lookups for stale cotent

    const details$ = staleIds$.pipe(
        withLatestFrom(history$),
        map(buildBulkContentUrl),
        ajaxGet(),
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
        tap(manifest => console.log('manifest$', manifest)),
        share(),
    );

    const ds$ = sharedManifest$.pipe(
        filter(o => o.history_content_type == "dataset"),
        withLatestFromDb(dataset$),
        mergeMap(filterStaleContent)
    );

    const dsc$ = sharedManifest$.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        withLatestFromDb(datasetCollection$),
        mergeMap(filterStaleContent)
    );

    // if this never completes, reduce won't work
    return merge(ds$, dsc$).pipe(
        filter(Boolean),
        pluck('id'),
        reduce((list, id) => ([ ...list, id ]), [])
    );
}


// Compare returned content object to version stored in the local database. If
// the update_time is newer, then store this ID for a later bulk detail update.

async function filterStaleContent([ item, collection ]) {

    const newVersionDate = Date.parse(item.update_time);

    const existing = await collection.findOne(item.id).exec();
    if (existing) {
        const existingDate = Date.parse(existing.update_time);
        if (existingDate >= newVersionDate) {
            return null;
        }
    }

    // returning an item means this item is stale and needs a server update
    return item;
}
