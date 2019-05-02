import { of, merge, combineLatest, from } from "rxjs";
import { tap, map, mergeMap, share, mapTo, 
    filter, pluck, bufferTime } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { dataset$, datasetCollection$ } from "../db";
import { conformToSchema, datasetSchema, datasetCollectionSchema } from "../schema";
import { log } from "../utils";

export function CachedHistoryContent$(history$, manifest$) {

    // Check cache against manifest to see which content items need updating
    let staleDatasets$ = staleContent(manifest$, dataset$, "dataset");
    let staleCollections$ = staleContent(manifest$, datasetCollection$, "dataset_collection");
    let staleIDs$ = merge(staleDatasets$, staleCollections$).pipe(
        pluck('id'),
        bufferTime(1000),
        tap(log('stale'))
    );

    // do bulk content ajax call
    // let update$ = combineLatest(history$, staleIDs$).pipe(
    //     map(generateBufferUrl),
    //     mergeMap(getContentUpdates),
    //     mergeMap(o => o),
    //     share()
    // );

    return staleIDs$;

    // update datasets
    
    
    // // update dataset collections
    // let dsc$ = update$.pipe(
    //     filter(o => o.history_content_type == "dataset_collection"),
    //     map(processRawDatasetCollection),
    //     mergeMap(item => combineLatest(datasetCollection$, of(item))),
    //     mergeMap(inputs => from(cacheContentItem(inputs)))
    // );

    // // update cache
    // return merge(ds$, dsc$);
}


// compares id & update_time in manifest to version in collection,
// emits manifest items that need updating
function staleContent(manifest$, collection$, contentType) {

    let filteredItems = manifest$.pipe(
        filter(o => {
            try {
                return o.history_content_type == contentType;
            } catch(err) {
                debugger;
            }
        }),
    );

    // let combo = combineLatest(collection$, filteredItems).pipe(
    //     map(([coll, item]) => {
    //         debugger;
    //         return item;
    //     })
    // )

    return filteredItems;

    // return filteredItems$.pipe(
    //     tap(log('parameter beforefuckery')),
    //     // withLatest doesn't work
    //     mergeMap(item => {
    //         debugger;
    //         combineLatest(collection$, of(item))), 
    //     // mergeMap(([coll, item]) => {
    //     //     debugger;
    //     //     return from(checkCacheForItem(coll, item)).pipe(
    //     //         tap(log('lookup')),
    //     //         filter(result => result == null),
    //     //         mapTo(item)
    //     //     );
    //     // })
    // )
}

async function checkCacheForItem(collection, item) {
    let lastUpdated = Date.parse(item.update_time);
    return await collection.findOne(item.id)
        .where('update_time').gte(lastUpdated)
        .exec();
}

function generateBufferUrl([ history, ids = [] ]) {
    if (ids.length) {
        let idList = ids.join(",");
        return `/api/histories/${history.id}/contents?ids=${idList}`;
    }
    return null;
}

function getContentUpdates(url) {
    return ajax.getJSON(url);
}

const conformDataset = conformToSchema(datasetSchema);
function processRawDataset(raw) {
    let o = conformDataset(raw);
    o.update_time = Date.parse(raw.update_time);
    return o;
}

const conformCollection = conformToSchema(datasetCollectionSchema);
function processRawDatasetCollection(raw) {
    let ds = conformCollection(raw);
    return ds;
}

async function cacheContentItem([ collection, item ]) {
    let result = await collection.atomicUpsert(item);
    return result;
}
