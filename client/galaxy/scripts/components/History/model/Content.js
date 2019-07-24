import { pipe } from "rxjs";
import { tap, pluck, map, switchMap, distinctUntilChanged, reduce } from "rxjs/operators";
import { withLatestFromDb, historyContent$, cacheContent } from "caching";
import { SearchParams } from "./SearchParams";
import { operateOnArray } from "utils/observable";
import moment from "moment";


// Retrieves observable query to local content matching source parameters

export const getContentObservable = (label, debug = false) => pipe(
    // Don't care about start/end for local display
    map(p => p.clone().removeLimits()),
    distinctUntilChanged(SearchParams.equals),
    tap(params => {
        if (debug) {
            params.report("getContentObservable input params");
        }
    }),
    withLatestFromDb(historyContent$),
    map(buildLocalContentQuery(label, debug)),
    switchMap(query => query.$),
    tap(results => {
        if (debug) {
            console.log("getContentObservable", label, results);
        }
    })
);

const buildLocalContentQuery = (label, debug = false) => ([params, coll]) => {

    let query = coll.find().where("history_id").eq(params.historyId);

    if (!params.showDeleted) {
        // limit to non-deleted
        query = query.where("isDeleted").eq(false);
        // datasetcollection has no purged property
        query = query.or([{ purged: false }, { purged: undefined }]);
    }

    if (!params.showHidden) {
        // limit to visible
        query = query.where("visible").eq(true);
    }

    if (params.filterText.length) {
        const filterRE = new RegExp(params.filterText, "gi");
        query = query.where("name").regex(filterRE);
    }

    // if (params.start !== null) {
    //     query = query.where("hid").gte(params.start);
    // }

    // if (params.end !== null) {
    //     query = query.where("hid").lte(params.end);
    // }

    query = query.sort("-hid");

    if (debug) {
        console.groupCollapsed("buildLocalContentQuery", label);
        params.report(label);
        console.log("query", query.mquery);
        console.log(query.stringRep);
        console.groupEnd();
    }

    return query;
};

// takes a stream of content and emits the latest update_time
// content$ must complete for this to work since it uses a reduce

export const latestContentDate = () => pipe(
    pluck("update_time"),
    map(ut => moment.utc(ut).valueOf()),
    reduce(Math.max, 0),
    map(stamp => moment.utc(stamp + 1)), // +1 for rounding error on server
    map(lastDate => lastDate.toISOString())
);


export const cacheContentArray = debug => pipe(
    operateOnArray(cacheContent(debug)),
    tap(cached => {
        if (debug) {
            console.log("cached results", cached.length);
        }
    })
);

// The manual update content URL and polling update URL are very similar.
// Polling: requires the since date
// Param Change: remove update_time limit, add end HID clamp

export const buildContentUrl = debug => params => {
    
    const base = `/api/histories/${params.historyId}/contents?v=dev&view=summary&keys=accessible`;
    const order = "order=hid-dsc";
    const limit = `limit=${params.pageSize}`;
    const endClause = params.end ? `q=hid-le&qv=${params.end}` : "";
    
    const since = params.lastCalled;
    const updateClause = since ? `q=update_time-gt&qv=${since.toISOString()}` : "";
    params.markLastCalled();

    let deletedClause = "", purgedClause = "";
    if (!params.showDeleted) {
        // limit to non-deleted
        deletedClause = `q=deleted&qv=False`;
        purgedClause = `q=purged&qv=False`;
    }

    let visibleClause = "";
    if (!params.showHidden) {
        // limit to visible
        visibleClause = `q=visible&qv=True`;
    }

    const textFilter = params.textFilter ? `q=name-contains&qv=${textFilter}` : "";

    const parts = [base, deletedClause, purgedClause,
        visibleClause, textFilter, endClause, updateClause,
        order, limit];

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
};


export const buildContentUrlForHistory = debug => history => {
    
    const base = `/api/histories/${history.id}/contents?v=dev&view=summary&keys=accessible`;
    const since = moment.utc(history.update_time);
    const updateClause = `q=update_time-gt&qv=${since.toISOString()}`
    
    const parts = [ base, updateClause ];
    const url = parts.filter(o => o.length).join("&");

    if (debug) {
        console.groupCollapsed("buildContentUrlForHistory");
        console.log("parts", parts);
        console.log("since", since);
        console.log("url", url);
        console.groupEnd();
    }
    return url;
};

