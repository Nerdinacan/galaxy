import { of, zip, concat, isObservable } from "rxjs";
import { filter, map, pluck, share, take } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { getCachedDataset, cacheDataset, getCachedDatasetCollection, cacheDatasetCollection } from "caching";
import { firstItem, ajaxGet } from "utils/observable";
import { prependPath } from "utils/redirect";

// debugging
// import { create } from "rxjs-spy";
// import { tag } from "rxjs-spy/operators";


/**
 * Generates an observable that compares the local dataset data to the content
 * by update_time, determines whether or not the dataset data is stale, requests
 * that dataset if it is stale, then re-caches the result.
 */
export function Dataset$(content) {
    const content$ = isObservable(content) ? content : of(content);
    return content$.pipe(
        getFresh(getCachedDataset, cacheDataset)
    );
}

export function DatasetCollection$(content) {
    const content$ = isObservable(content) ? content : of(content);
    return content$.pipe(
        getFresh(getCachedDatasetCollection, cacheDatasetCollection)
    );
}

export const getFresh = (loader, cacher, debug = false) => c$ => {
    
    const content$ = c$.pipe(share());

    // current dataset data in indexDB
    const existing$ = content$.pipe(
        pluck('id'), 
        loader(debug)
    );

    // compare to content, if content is newer, that means polling picked
    // up an update and we have to retrieve the new dataset
    const stale$ = zip(content$, existing$).pipe(
        filter(([ content, item ]) => {
            if (!item) return true;
            return item.getUpdateDate().isBefore(content.getUpdateDate());
        })
    )

    // actual request
    const retrievedVersion$ = stale$.pipe(
        map(buildUpdateUrl),
        ajaxGet(),
        firstItem(),
        cacher(debug)
    )
    
    // if server never emits, take original value
    return concat(retrievedVersion$, existing$).pipe(take(1))
}

// item may be null indicating we haven't loaded this dataset yet
function buildUpdateUrl([ content, item = null ]) {
    const { history_id, hid } = content;
    const base = `/api/histories/${history_id}/contents?v=dev&view=detailed`;
    const hidClause = `q=hid&qv=${hid}`;
    const updateClause = item ? `q=update_time-gt&qv=${item.update_time}` : "";
    const parts = [ base, hidClause, updateClause ];
    return parts.filter(o => o.length).join("&");
}


/**
 * Updates dataset with passed fields. Returns database object.
 * To use as a promise function, add .toPromise() to the returned
 * observable.
 * 
 * @param {*} dataset 
 * @param {*} fields 
 */
export function updateDatasetFields(dataset, fields = {}) {
    const request = buildUpdateRequest(dataset, fields);
    return ajax(request).pipe(
        filter(ajaxResponse => ajaxResponse.status == 200),
        pluck('response'),
        cacheDataset(true)
    );
}

function buildUpdateRequest(dataset, body) {
    const { history_id, id } = dataset;
    return { 
        method: "PUT",
        url: prependPath(`/api/histories/${history_id}/contents/${id}?view=detailed`),
        body
    };
}
