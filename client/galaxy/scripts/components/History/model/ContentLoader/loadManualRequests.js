import { Subject, merge, from } from "rxjs";
import { mergeMap, tap, pluck, share, map, withLatestFrom } from "rxjs/operators";
import { ajaxGet, distinctInSet } from "utils/observable";
import { SearchParams } from "../SearchParams";


// keeps a list of all previously requested urls since page-load
// avoids duplicate requests. Clears on page refresh.
const sessionRequests = new Set();

/**
 * Operator does ajax requests matching source SearchParam object. Splits large
 * requests into smaller ajax chunks based on SearchParams.pageSize, avoids
 * returning duplicate requests
 *
 * intended source observable: Observable<SearchParam>
 */
export const loadManualRequests = () => param$ => {

    const nextPageParam$ = new Subject();

    const stopPoint$ = param$.pipe(
        pluck('start')
    );

    const input$ = merge(param$, nextPageParam$).pipe(
        map(p => p.chunkEnd())
    )

    const result$ = input$.pipe(
        map(buildContentUrl),
        distinctInSet(sessionRequests),
        ajaxGet(),
        share()
    )

    return result$.pipe(
        withLatestFrom(stopPoint$, input$),
        tap(([ results, stopPoint, currentParam ]) => {

            if (results.length) {
                currentParam.markLastCalled();
            }

            // the expected bottom edge of the last result set
            const pageBottom = currentParam.end - SearchParams.pageSize;

            // the lowest HID value of the last result set
            // const hids = results.map(c => c.hid);
            // const minHid = Math.min(pageBottom, ...hids);

            // we might have big gaps in the result, if so take the expected
            // page bottom instead of the real bottom
            const lastRow = Math.max(pageBottom, 0);

            if (lastRow > stopPoint) {
                nextPageParam$.next(currentParam.nextPage());
            }

        }),
        mergeMap(([ results ]) => from(results))
    )
}


/**
 * Generates request url for a given set of request parameters.
 */
const buildContentUrl = params => {

    const base = `/api/histories/${params.historyId}/contents?v=dev&view=summary&keys=accessible`;
    const order = "order=hid-dsc";

    let endClause = "";
    if (params.end && params.end < Number.POSITIVE_INFINITY) {
        endClause = `q=hid-le&qv=${params.end}`;
    }

    const limitClause = `limit=${SearchParams.pageSize}`;

    // if (params.start == null) {
    //     limitClause = `limit=${SearchParams.pageSize}`;
    // } else {
    //     startClause = `q=hid-ge&qv=${params.start}`;
    // }

    // const since = params.lastCalled;
    // const updateClause = since ? `q=update_time-gt&qv=${since.toISOString()}` : "";
    const updateClause = "";

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

    const parts = [ base, endClause, limitClause,
        deletedClause, purgedClause, visibleClause, textFilter,
        updateClause, order ];

    return parts.filter(o => o.length).join("&");
}
