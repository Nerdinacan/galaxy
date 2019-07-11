import { combineLatest, merge } from "rxjs";
import { tap, map, filter, first, reduce, share, distinctUntilChanged } from "rxjs/operators";
import { ajaxGet, split } from "./utils";
import { cacheContent, cacheDataset, cacheDatasetCollection } from "./CachedData";
import { localContentQuery } from "./Content$";
import { SearchParams } from "../SearchParams";

// Content Manifest
// do a contents request, this is a list of all the content matching
// the indicated parameters

export function ContentUpdate$(history$, param$) {

    // generate a new params object that selects
    // stuff the user may have temporarily turned off
    
    const localContent$ = param$.pipe(
        map(p => {
            const serverParams = new SearchParams(p);
            serverParams.showDeleted = true;
            serverParams.showHidden = true;
            return serverParams;
        }),
        distinctUntilChanged(SearchParams.equal),
        localContentQuery()
    );


    // use that query to find the latest date of the history content
    
    const latestContentDate$ = localContent$.pipe(
        first(),
        split(),
        map(item => item.getServerStamp()),
        reduce(Math.max, 0)
    );


    // get the manifest, which is a summary of everything
    
    const manifest$ = combineLatest(history$, param$, latestContentDate$).pipe(
        first(),
        map(buildManifestUrl),
        ajaxGet(),
        split(),
        share(),
        cacheContent()
    );

    return manifest$;


    // now get a list of content


    // // Store all that stuff.
    
    // const cachedDatasets$ = manifest$.pipe(
    //     filter(o => o.history_content_type == "dataset"),
    //     cacheDataset()
    // );

    // const cachedCollections$ = manifest$.pipe(
    //     filter(o => o.history_content_type == "dataset_collection"),
    //     cacheDatasetCollection()
    // );

    // return merge(cacheContent$, cachedDatasets$, cachedCollections$);
}



// gets content manifest

function buildManifestUrl([ history, params, lastUpdate ]) {

    const base = `/api/histories/${params.historyId}/contents?v=dev&view=summary`;
    const updateCriteria = lastUpdate ? `q=update_time-gt&qv=${lastUpdate}` : "";
    
    const end = params.end ? params.end : history.hid_counter;
    const start = params.start ? params.start : end - SearchParams.chunkSize;
    const startClause = `q=hid-ge&qv=${start}`;
    const endClause = `q=hid-le&qv=${end}`;

    const order = "order=hid-dsc";

    // deleted/purged
    // TODO: rework ridiculous api boolean filters
    let deleteFilter = "", purgeFilter = "";
    // if (params.showDeleted === false) {
    //     deleteFilter = "q=deleted&qv=False";
    //     purgeFilter = "q=purged&qv=False";
    // }

    // hide/show
    let visibleFilter = "";
    // if (params.showHidden) {
    //     visibleFilter = "q=visible&qv=True";
    // }

    // text filter
    let textFilter = "";
    // if (params.filterText.length) {
    //     textFilter = `q=name-contains&qv=${params.filterText}`;
    // }

    // result
    const parts = [
        base, startClause, endClause, updateCriteria, order,
        textFilter, deleteFilter, purgeFilter, visibleFilter
    ];

    return parts.filter(o => o.length).join("&");
}