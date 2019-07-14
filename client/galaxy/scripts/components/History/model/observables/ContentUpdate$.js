import { of, combineLatest, merge } from "rxjs";
import { tap, map, filter, first, reduce, share, switchMap, mergeMap } from "rxjs/operators";
import { ajaxGet, split } from "./utils";
import { cacheContent, cacheDataset, cacheDatasetCollection } from "./CachedData";
import { localContentQuery } from "./Content$";
import { SearchParams } from "../SearchParams";


export function ContentUpdate$(p$, counter) {

    const param$ = p$.pipe(
        map(prefetchParams)
    );

    // Only take the content last date if the params haven't changed
    const lastDate$ = param$.pipe(
        switchMap(p => counter ? of(p).pipe(latestContentDate()) : of(null))
    );

    const manifest$ = combineLatest(param$, lastDate$).pipe(
        first(),
        map(buildManifestUrl("manifest$", true)),
        ajaxGet(),
        split(),
        share()
    );

    const cacheContent$ = manifest$.pipe(
        cacheContent()
    );

    const cachedDatasets$ = manifest$.pipe(
        filter(o => o.history_content_type == "dataset"),
        cacheDataset()
    );

    const cachedCollections$ = manifest$.pipe(
        filter(o => o.history_content_type == "dataset_collection"),
        cacheDatasetCollection()
    );

    return merge(cacheContent$, cachedCollections$, cachedDatasets$);
}



// Finds the latest update_time in the indicated start/end range

const latestContentDate = () => param$ => {
    return param$.pipe(
        switchMap(p => {
            return of(p).pipe(
                localContentQuery(),
                map(query => query.where('hid').gte(p.start).where('hid').lte(p.end)),
                mergeMap(query => query.$)
            );
        }),
        first(),
        split(),
        map(item => item.getServerStamp()),
        reduce(Math.max, 0)
    );
}




// Eager load a few of the results when the params change

const prefetchParams = p => {
    const newParams = p.clone();
    // newParams.end = p.end + SearchParams.chunkSize;
    newParams.start = p.start - SearchParams.chunkSize;
    return newParams;
}


// gets content manifest

const buildManifestUrl = (label, debug) => ([ params, lastUpdate ]) => {

    const { start, end, historyId } = params;

    const base = `/api/histories/${historyId}/contents?v=dev&view=detailed`;
    const updateCriteria = lastUpdate ? `q=update_time-gt&qv=${lastUpdate}` : "";
    const startClause = `q=hid-ge&qv=${start}`;
    const endClause = `q=hid-le&qv=${end}`;
    const order = "order=hid-dsc";

    // deleted/purged
    // TODO: rework ridiculous api boolean filters
    let deleteFilter = "", purgeFilter = "";
    if (params.showDeleted === false) {
        deleteFilter = "q=deleted&qv=False";
        purgeFilter = "q=purged&qv=False";
    }

    // hide/show
    let visibleFilter = "";
    if (params.showHidden) {
        visibleFilter = "q=visible&qv=True";
    }

    // text filter
    let textFilter = "";
    if (params.filterText.length) {
        textFilter = `q=name-contains&qv=${params.filterText}`;
    }

    const parts = [ base, updateCriteria, startClause, endClause, order, 
        deleteFilter, purgeFilter, visibleFilter, textFilter ];

    const url = parts.filter(o => o.length).join("&");

    if (debug) {
        console.groupCollapsed("buildManifestUrl", label, lastUpdate);
        console.log("start", start);
        console.log("end", end);
        console.log("lastUpdate", lastUpdate);
        console.log("url", url);
        console.groupEnd();
    }

    return url;
}
