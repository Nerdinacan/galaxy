import { filter, map, withLatestFrom } from "rxjs/operators";
import { load, split } from "./utils";
import { cacheContent } from "./CachedData";


// Content Manifest
// do a contents request, this is a list of all the content matching
// the indicated parameters

export function Manifest$(history$, param$) {
    return history$.pipe(
        withLatestFrom(param$),
        filter(needsManifest),
        map(buildManifestUrl),
        load(),
        split(),
        cacheContent()
    );
}


// checks to see if history/params needs a manifest

function needsManifest([ history, params ]) {
    const contentDate = params.contentLastUpdated;
    const historyDate = new Date(history.update_time);
    if (contentDate) {
        if (contentDate > historyDate) {
            return false;
        }
    }
    return true;
}


// gets content manifest

function buildManifestUrl([ history, params ]) {

    const base = `/api/histories/${history.id}/contents?v=dev&view=summary`;
    const offset = `offset=${params.offset}`;
    const limit = `limit=${params.limit}`;
    const orderClause = "order=hid-dsc";

    // deleted purged
    // TODO: rework ridiculous api boolean filter-failure
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

    // Update time
    const lastUpdated = params.contentLastUpdated;
    const updateCriteria = lastUpdated ? `q=update_time-gt&qv=${lastUpdated.toISOString()}` : "";
    params.contentLastUpdated = new Date();

    // Url
    const parts = [
        base, limit, offset, orderClause, 
        textFilter, deleteFilter, purgeFilter, visibleFilter,
        updateCriteria
    ];

    return parts.filter(o => o.length).join("&");
}