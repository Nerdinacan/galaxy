import { pipe } from "rxjs";
import { switchMap, map, distinctUntilChanged} from "rxjs/operators";
import { withLatestFromDb, historyContent$ } from "caching";
import { SearchParams } from "../SearchParams";


/**
 * Rxjs operator that returns an rxdb query against the local database showing
 * everything matching the source parameters. (i.e. run an observable parameter
 * string through this operator)
 *
 * intended source: Observable<SearchParams>
 *
 * @param {*} label
 * @param {*} debug
 */

export const contentObservable = config => {

    const { label = "contentObservable", debug = false } = config;

    return pipe(
        // Don't care about start/end for local display
        map(p => p.removeLimits()),
        distinctUntilChanged(SearchParams.equals),
        withLatestFromDb(historyContent$),
        map(buildLocalContentQuery({ label, debug })),
        switchMap(query => query.$)
    )
}

/**
 * Generates a live rxdb query to the content that is stored locally in indexDB,
 * filteres according to passed parameters
 * @param {*} config
 */
const buildLocalContentQuery = config => ([ params, coll ]) => {

    const { label, debug = false } = config;

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

    return query;
}
