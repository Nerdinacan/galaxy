import { of, zip, pipe, combineLatest, forkJoin, from } from "rxjs";
import { tap, filter, map, pluck, share, take } from "rxjs/operators";
import { getCachedContent, getCachedDataset, getCachedDatasetCollection,
    cacheDataset, cacheDatasetCollection, updateDocFields } from "caching";
import { firstItem, ajaxGet } from "utils/observable";
import { safeAssign } from "utils/safeAssign";
import { updateContentFields } from "./queries";

// import { create } from "rxjs-spy";
// import { tag } from "rxjs-spy/operators";
// window.spy = create();


/**
 * Generates a datset observable from source content. Updates self if dataset
 * data is too stale.
 * @param {*} content$
 */
export function Dataset$(content$) {

    // lookup function that takes content and
    // finds the dataset we're looking for,
    // typically one of the "getCachedX" functions
    const lookupFn = debug => pipe(
        pluck('id'),
        getCachedDataset(debug),
        take(1)
    );

    return content$.pipe(
        tap(checkForUpdates({
            debug: false,
            lookupFn,
            storeFn: cacheDataset
        })),
        pluck("id"),
        getCachedDataset(),
    )
}

export function DatasetCollection$(type_id) {

    const lookupFn = debug => pipe(
        pluck('id'),
        getCachedDatasetCollection(debug),
        take(1)
    );

    return of(type_id).pipe(
        getCachedContent(),
        tap(checkForUpdates({
            debug: false,
            lookupFn,
            storeFn: cacheDatasetCollection
        })),
        pluck("id"),
        getCachedDatasetCollection(),
    )
}


/**
 * Side effect, looks at the content, compares with a lookup dataset or dataset
 * collection. If that collection is stale, retrieves a new version from server
 * and caches it locally. Configuration allows for customization of the lookup
 * and cache operators, but in practice it'll probably just be a combination of
 * the standard cacheDataset/getDataset functions.
 */
const checkForUpdates = config => c => {

    const { lookupFn, storeFn, debug = false } = config;

    const content$ = of(c);

    // dataset or collection
    const ds$ = content$.pipe(
        lookupFn(debug)
    );

    const stale$ = zip(content$, ds$).pipe(
        filter(([ content, item ]) => {
            if (!item) return true;
            return item.getUpdateDate().isBefore(content.getUpdateDate());
        })
    )

    const retrievedVersion$ = stale$.pipe(
        map(buildDatasetUpdateUrl),
        ajaxGet(),
        firstItem(),
        storeFn(debug)
    )

    retrievedVersion$.subscribe({
        next: item => console.log("checkForUpdates", item),
        error: err => console.warn("checkForUpdates", err),
        // complete: () => console.log("checkForUpdates complete")
    });
}

function buildDatasetUpdateUrl([ content, item = null ]) {
    const { history_id, type_id } = content;
    const base = `/api/histories/${history_id}/contents?v=dev&view=detailed`;
    const hidClause = `q=type_id-in&qv=${type_id}`;
    const parts = [ base, hidClause ];
    return parts.filter(o => o.length).join("&");
}


// This function actually works for both datasets and collections

export function updateDataset(dataset, inputFields) {

    const dataset$ = of(dataset);

    const content$ = dataset$.pipe(
        pluck('type_id'),
        getCachedContent(),
        take(1)
    );

    // ajax call to update fields
    const savePromise = updateContentFields(dataset, inputFields);
    const savedFields$ = from(savePromise).pipe(
        map(updated => safeAssign(inputFields, updated)),
        take(1),
        share()
    );

    // cache in dataset/datasetCollection rxdb collection
    const cachedDataset$ = combineLatest(dataset$, savedFields$).pipe(
        updateDocFields()
    );

    // cache in content summary
    const cachedContent$ = combineLatest(content$, savedFields$).pipe(
        updateDocFields()
    );

    // wait for all thats
    return forkJoin([ cachedDataset$, cachedContent$ ]);
}


