import { merge, pipe, of } from "rxjs";
import { tap, map, mergeMap } from "rxjs/operators";
import { history$, historyContent$, dataset$,
    datasetCollection$, paramDateCollection$ } from "./db";
import { prepareHistory, prepareContentSummary,
    prepareDataset, prepareDatasetCollection } from "./prepare";
import { getItem, setItem, deleteItem } from "./genericOperators";

// import { create } from "rxjs-spy";
// import { tag } from "rxjs-spy/operators";
// window.spy = create();



// load item from cache by source: primary key

export const getCachedHistory = debug => pipe(
    getItem(history$, debug)
)

export const getCachedContent = debug => pipe(
    getItem(historyContent$, debug)
)

export const getCachedDataset = debug => pipe(
    getItem(dataset$, debug)
)

export const getCachedDatasetCollection = debug => pipe(
    getItem(datasetCollection$, debug)
)

export const getParamDate = debug => pipe(
    getItem(paramDateCollection$, debug)
)


// Store pased item (prepare then cache)

export const cacheHistory = debug => pipe(
    map(prepareHistory),
    setItem(history$, debug)
)

export const cacheContent = debug => pipe(
    map(prepareContentSummary),
    setItem(historyContent$, debug)
)

export const cacheParamDate = debug => pipe(
    setItem(paramDateCollection$, debug)
)


// when we cache a dataset, cache the corresponding content too

export const cacheDataset = debug => pipe(
    tap(ds => of(ds).pipe(
        cacheContent(debug)
    ).subscribe()),
    map(prepareDataset),
    setItem(dataset$, debug)
)

export const cacheDatasetCollection = debug => pipe(
    tap(dsc => of(dsc).pipe(
        cacheContent(debug)
    ).subscribe()),
    map(prepareDatasetCollection),
    setItem(datasetCollection$, debug)
)


// Remove source item from history

export const deleteHistory = () => pipe(
    deleteItem(history$)
)

export const deleteContent = () => pipe(
    deleteItem(historyContent$)
)

export const deleteDataset = () => pipe(
    deleteItem(dataset$)
)

export const deleteDatasetCollection = () => pipe(
    deleteItem(datasetCollection$)
)



// Delete stuff from dataset and historycontent

export function flushCachedDataset(ds) {
    const wipeDs = dataset$.pipe(mergeMap(coll => coll.findOne(ds.id).remove()));
    const wipeContent = historyContent$.pipe(mergeMap(coll => coll.findOne(ds.type_id).remove()));
    const killMe = merge(wipeDs, wipeContent);
    killMe.subscribe(
        null,
        // result => console.log("flushCachedDataset result", result),
        err => console.warn("flushCachedDataset error", err),
        () => console.log("flushCachedDataset complete")
    );
}


/* update existing docs, start with key */

export async function cacheDatasetFields(dataset, fields) {
    console.log("cacheDatasetFields", dataset, fields);
}

export async function cacheDscFields(dsc, fields) {
    console.log("cacheDscFields", dsc, fields);
}
