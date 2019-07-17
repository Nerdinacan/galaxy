import { pipe } from "rxjs";
import { ajax } from "rxjs/ajax";
import { tap, pluck, map, switchMap, distinctUntilChanged, reduce } from "rxjs/operators";
import { withLatestFromDb, historyContent$, cacheContent } from "caching";
import { SearchParams } from "../SearchParams";
import { prependPath } from "utils/redirect";
import { operateOnArray } from "utils/observable";
import moment from "moment";


// Retrieves observable query to local content matching source parameters

export const getContentObservable = (label, debug = false) => pipe(
    distinctUntilChanged(SearchParams.equals),
    withLatestFromDb(historyContent$),
    map(buildLocalContentQuery(label, debug)),
    switchMap(query => query.$)
)


// Takes a history returns a stream of all the cached contents
// regardless of parameters

export const getAllLocalHistoryContents = (label, debug = false) => pipe(
    map(SearchParams.entireHistory),
    getContentObservable(label, debug)
)


const buildLocalContentQuery = (label, debug = false) => ([params, coll]) => {

    let query = coll.find().where("history_id").eq(params.historyId);

    if (!params.showDeleted) {
        query = query.where("isDeleted").eq(false);
        query = query.where("purged").eq(false);
    }

    if (!params.showHidden) {
        query = query.where('visible').eq(true);
    }

    if (params.filterText.length) {
        const filterRE = new RegExp(params.filterText, "gi");
        query = query.where("name").regex(filterRE);
    }

    if (params.start !== null) {
        query = query.where("hid").gte(params.start);
    }

    if (params.end !== null) {
        query = query.where("hid").lte(params.end);
    }

    query = query.sort("-hid");

    if (debug) {
        console.groupCollapsed("buildLocalContentQuery", label);
        params.report(label);
        console.log("query", query.mquery);
        console.log(query.stringRep);
        console.groupEnd();
    }

    return query;
}



// takes a stream of content and emits the latest update_time
// content$ must complete for this to work since it uses a reduce

export const latestContentDate = () => pipe(
    pluck("update_time"),
    map(ut => moment.utc(ut).valueOf()),
    reduce(Math.max, 0),
    map(stamp => moment.utc(stamp + 1)), // +1 for rounding error on server
    map(lastDate => lastDate.toISOString())
)


// Loading content from server

export const loadAndCacheContentForParams = debug => pipe(
    // this query needs an end clause, but no date limit
    map(buildContentUrl),
    map(prependPath),
    switchMap(ajax.getJSON),
    operateOnArray(cacheContent(debug)),
    tap(result => {
        if (debug) {
            console.log("loadAndCacheContentForParams", result);
        }
    })
)




// The manual update content URL and polling update URL are very similar.
// Polling: requires the since date
// Param Change: remove update_time limit, add end HID clamp

export function buildContentUrl(params, debug) {

    const base = `/api/histories/${params.historyId}/contents?v=dev&view=summary&keys=accessible`;
    const order = "order=hid-dsc";
    const limit = `limit=${params.limit}`;
    const endClause = params.end ? `q=hid-le&qv=${params.end}` : "";

    const since = params.lastCalled;
    const updateClause = since ? `q=update_time-gt&qv=${since.toISOString()}` : "";
    params.markLastCalled();

    // TODO: Fix this ridiculous amateur-hour boolean parameter format 
    // on the api filters
    let deletedClause = "", purgedClause = "";
    if (!params.showDeleted) {
        deletedClause = `q=deleted&qv=False`;
        purgedClause = `q=purged&qv=False`;
    }

    let visibleClause = "";
    if (!params.showVisible) {
        visibleClause = `q=visible&qv=False`;
    }

    const textFilter = params.textFilter ? `q=name-contains&qv=${textFilter}` : "";

    const parts = [base, deletedClause, purgedClause, visibleClause, textFilter,
        endClause, updateClause, order, limit,];

    const url = parts.filter(o => o.length).join("&");

    if (debug) {
        console.groupCollapsed("buildContentUrl");
        console.log("params", params);
        console.log("parts", parts);
        console.log("since", since);
        console.log("url", url);
        console.groupEnd();
    }

    return url;
}
