import { of, zip, concat, isObservable } from "rxjs";
import { filter, map, pluck, share, mergeMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { getCachedDataset, cacheDataset } from "caching";
import { firstItem } from "utils/observable";
import { prependPath } from "utils/redirect";

/**
 * Generates an observable that compares the local dataset data to the content
 * by update_time, determines whether or not the dataset data is stale, requests
 * that dataset if it is stale, then re-caches the result.
 */
export function Dataset$(content) {
    const content$ = isObservable(content) ? content : of(content);
    return content$.pipe(getFreshDatsetFromContent());
}

const getFreshDatsetFromContent = (debug = false) => c$ => {
    
    const content$ = c$.pipe(
        share()
    );

    // current dataset data in indexDB
    const existingDataset$ = content$.pipe(
        pluck('id'),
        getCachedDataset(debug),
        share()
    );

    // compare to content, if content is newer, that means polling picked
    // up an update and we have to retrieve the new dataset
    const staleDataset$ = zip(content$, existingDataset$).pipe(
        filter(([ content, dataset ]) => {
            if (!dataset) return true;
            return dataset.getUpdateDate().isBefore(content.getUpdateDate());
        })
    );
    
    // actual request
    const serverDataset$ = staleDataset$.pipe(
        map(buildUpdateUrl),
        map(prependPath),
        mergeMap(url => ajax.getJSON(url)),
        firstItem(),
        cacheDataset(debug)
    );
    
    // if server never emits, take original value
    return concat(serverDataset$, existingDataset$).pipe(
        filter(Boolean)
    );
}


function buildUpdateUrl([ content, ds ]) {
    const { history_id, hid } = content;
    const base = `/api/histories/${history_id}/contents?v=dev&view=detailed`;
    const hidClause = `q=hid&qv=${hid}`;
    const updateClause = ds ? `q=update_time-gt&qv=${ds.update_time}` : "";
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
