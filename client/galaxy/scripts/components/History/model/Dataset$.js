import { of, zip, concat, pipe } from "rxjs";
import { tap, filter, map, pluck, share, take, switchMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { getCachedContent, getCachedDataset, cacheDataset, getCachedDatasetCollection, cacheDatasetCollection } from "caching";
import { firstItem, ajaxGet } from "utils/observable";
import { prependPath } from "utils/redirect";


import { create } from "rxjs-spy";
import { tag } from "rxjs-spy/operators";
window.spy = create();


// returns a dataset observable based on passed content item
export function Dataset$(content) {

    // load local dataset based from content
    const getExistingDataset = () => pipe(
        pluck('id'),
        getCachedDataset()
    )
    
    return of(content).pipe(
        getFresh(getExistingDataset, cacheDataset)
    )
}


export function DatasetCollection$(type_id) {

    console.log("DatsetCollection$", type_id);

    const getExistingCollection = () => pipe(
        pluck('id'),
        getCachedDatasetCollection(),
        take(1)
    )
    
    // get content by passed type_id
    const content$ = of(type_id).pipe(
        getCachedContent(),
        take(1)
    )

    return content$.pipe(
        getFresh(getExistingCollection, cacheDatasetCollection)
    )
}


export const getFresh = (loader, cacher) => c$ => {
    
    const content$ = c$.pipe(
        share()
    );

    // current dataset data in indexDB
    const existing$ = content$.pipe(
        loader()
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
        cacher(true)
    )
    
    // if server lookup never emits, take original value
    return concat(retrievedVersion$, existing$).pipe(
        take(1)
    )
}


function buildUpdateUrl([ content, item = null ]) {
    const { history_id, type_id } = content;
    const base = `/api/histories/${history_id}/contents?v=dev&view=detailed`;
    const hidClause = `q=type_id-in&qv=${type_id}`;
    const updateClause = item ? `q=update_time-gt&qv=${item.update_time}` : "";
    const parts = [ base, hidClause, updateClause ];
    return parts.filter(o => o.length).join("&");
}


export function updateDatasetFields(dataset, fields = {}) {

    const { history_id, id } = dataset;
    const url = prependPath(`/api/histories/${history_id}/contents/${id}?view=detailed`);
    const request = { method: "PUT", url, body: fields };

    return ajax(request).pipe(
        filter(ajaxResponse => ajaxResponse.status == 200),
        pluck('response'),
        cacheDataset(true)
    );
}
