
import { merge, combineLatest, pipe } from "rxjs";
import { map, mergeMap, share } from "rxjs/operators";
import { history$, historyContent$, dataset$, datasetCollection$, paramDateCollection$ } from "./db";
import { prepareHistory, prepareContentSummary, prepareDataset, prepareDatasetCollection } from "./prepare";
import { getItem, setItem, deleteItem } from "./operators";



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

export const cacheDataset = debug => input$ => {

    const item$ = input$.pipe(share());

    const content$ = item$.pipe(
        cacheContent(debug),
    );

    const ds$ = item$.pipe(
        map(prepareDataset),
        setItem(dataset$, debug),
    );

    return combineLatest(content$, ds$).pipe(
        map(inputs => inputs[1])
    );
}

export const cacheDatasetCollection = debug => input$ => {

    const item$ = input$.pipe(share());

    const content$ = item$.pipe(
        cacheContent(debug),
    );

    const dsc$ = item$.pipe(
        map(prepareDatasetCollection),
        setItem(datasetCollection$, debug),
    );

    return combineLatest(content$, dsc$).pipe(
        map(inputs => inputs[1])
    );
}


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

    const wipeDs = dataset$.pipe(
        mergeMap(coll => coll.findOne(ds.id).remove())
    )

    const wipeContent = historyContent$.pipe(
        mergeMap(coll => coll.findOne(ds.type_id).remove())
    )
    
    const killMe = merge(wipeDs, wipeContent)

    killMe.subscribe(
        null,
        // result => console.log("flushCachedDataset result", result), 
        err => console.warn("flushCachedDataset error", err), 
        () => console.log("flushCachedDataset complete")
    )
}
