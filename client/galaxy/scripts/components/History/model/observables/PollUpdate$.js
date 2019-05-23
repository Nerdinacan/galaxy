import { merge, combineLatest } from "rxjs";
import { switchMap, tap, reduce, pluck, filter, map, mergeMap, 
    share, withLatestFrom } from "rxjs/operators";
import { load, split, cacheInLocalDb } from "./utils";
import { dataset$, datasetCollection$ } from "../db";
import { prepareDataset, prepareDatasetCollection } from "../schema";
import { Manifest$ } from "./Manifest$";
import { Clock$ } from "./Clock$";



// when the request parameters change, restart the clock because
// the first emission will require a different query than subsequent
// update queries

const pollInterval = 3000;
const timeoutInterval = 10 * 60 * 1000;

export function PollUpdate$(history$, param$) {
    return combineLatest(history$, param$).pipe(
        switchMap(([ history, params ]) => {
            return Clock$(pollInterval, timeoutInterval).pipe(
                tap(counter => doUpdates(counter, history, params))
            );
        })
    );
}


// Run the update poll, runs every time the history,
// params or counter changes

export function doUpdates(counter, history, params) {

    // list of the contents for this history/params
    const manifest$ = Manifest$(history, params, counter);

    // get a list of the items on the manifest that need a full update
    // by checking the database for stale entries
    const staleIdList$ = getStaleContent(manifest$);

    // bulk ajax request for the stale content IDs
    const update$ = staleIdList$.pipe(
        filter(ids => ids.length),
        tap(ids => console.log("ids", ids)),
        map(bulkUpdateUrl(history)),
        load(),
        split(),
        share()
    );

    
    // Cache content items
    
    const cacheDS$ = update$.pipe(
        filter(o => o.history_content_type == "dataset"),
        map(prepareDataset),
        cacheInLocalDb(dataset$)
    );

    const cacheDSC$ = update$.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        map(prepareDatasetCollection),
        cacheInLocalDb(datasetCollection$)
    );


    return merge(cacheDS$, cacheDSC$).subscribe(
        null,
        err => console.warn("doUpdates err", counter, err),
        // () => console.log("doUpdates complete", counter)
    );
}


// collect stale ids when source completes

function getStaleContent(manifest$) {

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

function bulkUpdateUrl(history) {
    return (ids = []) => {
        const idList = ids.join(",");
        return `/api/histories/${history.id}/contents?ids=${idList}`;
    }
}
