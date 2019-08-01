import { of, zip, concat, pipe } from "rxjs";
import { filter, map, pluck, share, take } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { getCachedContent, getCachedDataset, cacheDataset, getCachedDatasetCollection, cacheDatasetCollection } from "caching";
import { firstItem, ajaxGet } from "utils/observable";
import { prependPath } from "utils/redirect";
import { buildUpdateUrl } from "./ContentLoader/buildUpdateUrl";

// import { create } from "rxjs-spy";
// import { tag } from "rxjs-spy/operators";
// window.spy = create();


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



export function updateContentFields(content, fields = {}) {

    const { history_id, id } = content;
    const body = {
        ...fields,
        type: content.history_content_type
    }
    const url = prependPath(`/api/histories/${history_id}/contents/${id}`);
    const request = { method: "PUT", url, body };

    return ajax(request).pipe(
        filter(ajaxResponse => ajaxResponse.status == 200),
        pluck('response')
    );
}




// TODO: maybe don't bother caching the response since polling should pick it up?

// export function updateDatasetFields(ds, fields = {}) {
//     return updateContentFields(ds, fields).pipe(
//         cacheDataset(true)
//     );
// }

// export function updateCollectionFields(dsc, fields = {}) {
//     return updateContentFields(dsc, fields).pipe(
//         // for whatever incompetent reasons, the api is inconsistent here
//         // the dataset collection response does not include the requested view
//         // in the same way the exact same call with a dataset does. Need to go
//         // get the values again.
//         tap(response => {
//             console.log("updated collection fields", response)
//         })
//     )
// }
