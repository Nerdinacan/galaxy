// import { isRxDocument } from "rxdb";
import { defer, of, merge, combineLatest, from } from "rxjs/index";
import { switchMap, bufferTime, concatMap, share, mapTo, filter, tap, pluck, map, mergeMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";

import { conformToSchema, datasetSchema, datasetCollectionSchema } from "./schema";
import { datasets, datasetCollections } from "./database";


const log = (label, method = console.log) => 
    args => method(label, args);


/**
 * Generates an observable for the history content
 * @param {observable} history$ 
 */
export function HistoryContent$(history$) {

    // do an ajax call to get a manifest of the contents for the indicated history
    let contentManifest = getContentManifest(history$).pipe(share());


    // Dataset

    // dataset items from manifest
    let manifestDataset = 
        contentManifest.pipe(
            filter(o => o.history_content_type == "dataset"),
        );
    
    // check cache, return ids
    let staleDataset = 
        combineLatest(datasets, manifestDataset).pipe(
            mergeMap(getStaleItems)
        );


    // Dataset Collections
    
    // filter out the datasets
    let staleDatasetCollection = 
        contentManifest.pipe(
            filter(o => o.history_content_type == "dataset_collection"),
            // TODO: actual cache check
        );


    // collect all the IDs together and bulk-query

    let staleIDs = 
        merge(staleDataset, staleDatasetCollection).pipe(
            pluck('id'),
            bufferTime(1500),
            tap(log('staleIDs'))
        );

    let freshContent = combineLatest(history$, staleIDs).pipe(
        map(generateBufferUrl),
        switchMap(url => url ? ajax.getJSON(url) : of([])),
        mergeMap(from), // split result into single items
        share()
    );
    

    // stash the datasets

    let newDatasets = freshContent.pipe(
        filter(o => o.history_content_type == "dataset"),
        map(processRawDataset)
    );

    let storedDatasets = combineLatest(datasets, newDatasets).pipe(
        concatMap(inputs => from(cacheContentItem(inputs)))
    );


    // and the collections

    let newCollections = freshContent.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        map(processRawDatasetCollection)
    );

    let storedCollections = combineLatest(datasetCollections, newCollections).pipe(
        concatMap(inputs => from(cacheContentItem(inputs)))
    );



    // Subscribe to both updating streams
    // TODO: figure out how to unsub this, takeUntil or something?
    let updates$ = merge(storedDatasets, storedCollections);


    return defer(() => {

        let content$ = 
            combineLatest(datasets, history$).pipe(
                switchMap(([coll, history]) => {
                    return coll.find().$;
                        // .where('history_id').eq(history.id);
                }),
                
                tap(log('thing'))
            )

        return merge(history$, updates$).pipe(
            tap(log('thing')),
            mapTo(content$)
        );
    })
}




// simple content query with types and update_times so we can invalidate
// the cache and do a more detailed query
function getContentManifest(history) {
    return history.pipe(
        pluck('contents_url'),
        map(url => `${url}?v=dev&keys=id,hid,history_id,history_content_type,url,update_time`),
        mergeMap(ajax.getJSON),
        mergeMap(from) // split result
    );
}

// return an observable


function getStaleItems([ collection, manifestItem ]) {
    return from(getCachedItem(collection, manifestItem)).pipe(
        filter(result => result == null),
        mapTo(manifestItem)
    );
}

async function getCachedItem(collection, item) {
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


// TODO: figure out how to make the indexDB preInsert / preSave
// hook do this for us instead of dealing with it here.

const conformDataset = conformToSchema(datasetSchema);
const conformCollection = conformToSchema(datasetCollectionSchema);

function processRawDataset(raw) {
    let ds = conformDataset(raw);
    ds.update_time = Date.parse(raw.update_time);
    return ds;
}

function processRawDatasetCollection(raw) {
    let ds = conformCollection(raw);
    // ds.update_time = Date.parse(raw.update_time);
    return ds;
}

async function cacheContentItem([ collection, item ]) {
    return await collection.atomicUpsert(item);
}
