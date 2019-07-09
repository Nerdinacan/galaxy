/**
 * Rxjs custom operators and other functions for accessing
 * the data stored locally in indexDb
 */

import { of, merge, combineLatest } from "rxjs";
import { tap, filter, map, mergeMap } from "rxjs/operators";
import { history$, historyContent$, dataset$, datasetCollection$ } from "../db";
import { prepareHistory, prepareManifestItem, prepareDataset, prepareDatasetCollection } from "../schema";
import { safeAssign } from "utils/safeAssign";


// There's something buggy about rxdb's collection
// objects, standard combineLatest/withLatestFrom don't
// seem to work reliably, this more explicit version does though

export const withLatestFromDb = rxDbObj$ => src$ => {
    return src$.pipe(
        mergeMap(src => combineLatest(of(src), rxDbObj$))
    )
}


/**
 * Retrieves item from indexDB collection given an
 * observable primary key
 * @param {Observable<RxCollection>} collection$
 */
const getCachedItem = (collection$, debug = false) => key$ => {
    return key$.pipe(
        filter(Boolean),
        withLatestFromDb(collection$),
        tap(([ key, coll ]) => {
            if (debug) {
                console.log("getCachedItem", coll.name, key);
            }
        }),
        mergeMap(([ key, coll ]) => {
            const keyField = coll.schema.primaryPath;
            const query = coll.findOne().where(keyField).eq(key);
            return query.$;
        })
    );
}

export const getCachedHistory = () => key$ => {
    return key$.pipe(
        getCachedItem(history$)
    );
}

export const getCachedContent = () => key$ => {
    return key$.pipe(
        getCachedItem(historyContent$)
    );
}

export const getCachedDataset = () => key$ => {
    return key$.pipe(
        getCachedItem(dataset$)
    );
}

export const getCachedDatasetCollection = () => key$ => {
    return key$.pipe(
        getCachedItem(datasetCollection$)
    );
}


/**
 * Cache object in rxdb collection
 * @param {Observable<RxCollection>} collection$
 */
const cacheItemInDb = (collection$, debug = false) => item$ => {
    return item$.pipe(
        withLatestFromDb(collection$),
        mergeMap(async ([ item, coll ]) => {
            if (debug) {
                console.log("caching", item);
            }
            const result = await coll.atomicUpsert(item);
            if (debug) {
                console.log("cache result", result);
            }
            return result;
        })
    )
}

export const cacheHistory = () => rawHistory$ => {
    return rawHistory$.pipe(
        map(prepareHistory),
        cacheItemInDb(history$)
    );
}

export const cacheContent = () => rawContent$ => {
    return rawContent$.pipe(
        map(prepareManifestItem),
        cacheItemInDb(historyContent$)
    );
}

export const cacheDataset = () => rawDS$ => {
    return rawDS$.pipe(
        map(prepareDataset),
        cacheItemInDb(dataset$)
    );
}

export const cacheDatasetCollection = () => rawDSC$ => {
    return rawDSC$.pipe(
        map(prepareDatasetCollection),
        cacheItemInDb(datasetCollection$)
    );
}


/**
 * Delete object from collection
 * @param {Observable<RxCollection>} collection$
 */
const deleteItemFromLocalDb = collection$ => item$ => {
    return item$.pipe(
        withLatestFromDb(collection$),
        mergeMap(async ([ item, coll ]) => {
            const keyField = coll.schema.primaryPath;
            const pKey = item[keyField];
            const query = coll.find().where(keyField).eq(pKey);
            return await query.remove();
        })
    );
}

export const deleteHistory = () => item$ => {
    return item$.pipe(
        deleteItemFromLocalDb(history$)
    );
}

export const deleteContent = () => item$ => {
    return item$.pipe(
        deleteItemFromLocalDb(historyContent$)
    );
}

export const deleteDataset = () => item$ => {
    return item$.pipe(
        deleteItemFromLocalDb(dataset$)
    );
}

export const deleteDatasetCollection = () => item$ => {
    return item$.pipe(
        deleteItemFromLocalDb(datasetCollection$)
    );
}





// TODO? rewrite in terms of tested operators?

// Delete stuff from dataset and historycontent

export function flushCachedDataset(ds) {

    const wipeDs = dataset$.pipe(
        mergeMap(coll => coll.findOne(ds.id).remove())
    );

    const wipeContent = historyContent$.pipe(
        mergeMap(coll => coll.findOne(ds.type_id).remove())
    );
    
    const killMe = merge(wipeDs, wipeContent);

    killMe.subscribe(
        null,
        // result => console.log("flushCachedDataset result", result), 
        err => console.warn("flushCachedDataset error", err), 
        () => console.log("flushCachedDataset complete")
    );
}


export async function cacheContentItem(item) {
    
    const props = prepareManifestItem(item);
    delete props.type_id;
    delete props._rev;
    props.update_time = (new Date(0)).toISOString();

    const coll = await historyContent$.toPromise();
    const existing = await coll.findOne(item.type_id).exec();
    if (!existing) {
        return await coll.newDocument(props).save();
    }
    
    return await existing.atomicUpdate(doc => safeAssign(doc, props));
}
