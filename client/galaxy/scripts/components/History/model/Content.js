import { pipe } from "rxjs";
import { tap, pluck, map, switchMap, distinctUntilChanged, reduce } from "rxjs/operators";
import { withLatestFromDb, historyContent$, cacheContent } from "caching";
import { SearchParams } from "./SearchParams";
import { operateOnArray } from "utils/observable";
import moment from "moment";


//#region Local Content Live rxdb query

export const getContentObservable = (label, debug = false) => pipe(
    // Don't care about start/end for local display
    map(p => p.clone().removeLimits()),
    distinctUntilChanged(SearchParams.equals),
    withLatestFromDb(historyContent$),
    switchMap(buildLocalContentQuery(label, debug))
)

const buildLocalContentQuery = (label, debug = false) => ([params, coll]) => {

    const selector = {
        history_id: { $eq: params.historyId }
    }

    if (!params.showDeleted) {
        // limit to non-deleted
        selector.isDeleted = { $eq: false };
    }

    if (!params.showHidden) {
        // limit to visible
        selector.visible = { $eq: true };
    }

    if (params.filterText.length) {
        const filterRE = new RegExp(params.filterText, "gi");
        selector.name = { $regex: filterRE };
    }

    let query = coll.find(selector);
    query = query.sort("-hid");

    if (debug) {
        console.groupCollapsed("buildLocalContentQuery", label);
        params.report(label);
        console.log("query", query.mquery);
        console.log(query.stringRep);
        console.groupEnd();
    }

    return query.$;
}

//#endregion


// takes a stream of content and emits the latest update_time
// content$ must complete for this to work since it uses a reduce

export const latestContentDate = () => pipe(
    pluck("update_time"),
    map(ut => moment.utc(ut).valueOf()),
    reduce(Math.max, 0),
    map(stamp => moment.utc(stamp + 1)), // +1 for rounding error on server
    map(lastDate => lastDate.toISOString())
)


export const cacheContentArray = debug => pipe(
    operateOnArray(cacheContent(debug)),
    tap(cached => {
        if (debug) {
            console.log("cached results", cached.length);
        }
    })
)


/**
 * Generates a URL for catching external updates to the source history.
 */
export const buildContentUrlForHistory = history => {
    const base = `/api/histories/${history.id}/contents?v=dev&view=summary&keys=accessible`;
    const since = moment.utc(history.update_time);
    const updateClause = `q=update_time-gt&qv=${since.toISOString()}`
    const parts = [ base, updateClause ];
    return parts.filter(o => o.length).join("&");
}
