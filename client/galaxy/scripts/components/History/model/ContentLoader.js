import { of, Subject, merge, isObservable, from } from "rxjs";
import { mergeMap, tap, pluck, share, map, take, shareReplay, takeUntil, withLatestFrom, distinct } from "rxjs/operators";
import { createInputFunction, ajaxGet, poll } from "utils/observable";
import { getParamsFromHistoryId } from "./paramStreaming";
import { getCachedHistory, cacheContent } from "caching";
import { getContentObservable, buildContentUrlForHistory, cacheContentArray } from "./Content";
import { historyUpdate } from "./History";
import { SearchParams } from "./SearchParams";
import store from "store";

// import { create } from "rxjs-spy";
// import { tag } from "rxjs-spy/operators";
// window.spy = create();


/**
 * Creates a subject and function to stop polling, primarily for debugging purposes.
 */
export const stopPolling = createInputFunction();


/**
 * Returns a subscription to three observables:
 * 
 * content$:
 * A direct subscription to an observable that updates the history
 * content for the passed id. This is what's viewed in the ContentList.vue 
 * 
 * manual$
 * Responds to parameter changes in the store to load new content as the user
 * filters and paginates through the content list. The request parameters are
 * (currently) housed in the store, though I still maintain that they would be
 * better represented as local state in the History vue components. Vuex is only
 * getting in the way here.
 * 
 * poll$
 * Periodically requests updates to the history. Updates are cached in the
 * background and need not be something that the user is currently looking at. I
 * also believe this mechanism will eliminate the need for other polling
 * operations in galaxy since the history object itself is cached as well as new
 * or updated contents.
 */
export function ContentLoader(id) {

    // incoming parameters
    const id$ = isObservable(id) ? id : of(id);
    const historyId$ = id$.pipe(share());
    const param$ = historyId$.pipe(
        getParamsFromHistoryId({ store, debug: false }),
        shareReplay(1)
    );

    // observable that renders content in the list, just
    // stares directly at the db for this history
    const content$ = param$.pipe(
        getContentObservable()
    );
    
    // ajax requests instantiated by filtering/pagination
    const manual$ = param$.pipe(
        loadManualRequests(),
        cacheContent(false)
    );

    // periodic updates
    const polling$ = historyId$.pipe(
        poll({ buildRequest }),
        takeUntil(stopPolling.$)
    );

    return {

        subscribe() {

            const contentSub = content$.subscribe.apply(content$, arguments);

            const manualSub = manual$.subscribe({
                complete: () => console.log("manual complete"),
                error: err => console.warn("manual err", err)
            });

            const pollSub = polling$.subscribe({
                complete: () => console.log("polling complete"),
                error: err => console.warn("polling err", err)
            });

            return contentSub.add(manualSub).add(pollSub);
        }

    }
}


/**
 * Operator does ajax requests matching source SearchParam object. Splits large
 * requests into smaller ajax chunks based on SearchParams.pageSize, avoids
 * returning duplicate requests.
 * 
 * Loops until returned request results are
 */
const loadManualRequests = () => param$ => {

    const nextPageParam$ = new Subject();

    const stopPoint$ = param$.pipe(
        pluck('start'),
        share()
    );

    const input$ = merge(param$, nextPageParam$).pipe(
        map(p => p.chunkEnd()),
        tap(p => p.report("INPUT:")),
        share()
    )

    const result$ = input$.pipe(
        pluck('contentUrl'),
        distinct(),
        ajaxGet(),
        share()
    )

    return result$.pipe(
        withLatestFrom(stopPoint$, input$),
        tap(([ results, stopPoint, currentParam ]) => {

            if (results.length) {
                currentParam.markLastCalled();
            }

            const hids = results.map(c => c.hid);
            console.log("results", results.length);
            console.log("stopPoint", stopPoint);

            const pageBottom = currentParam.end - SearchParams.pageSize;
            const minHid = Math.min(0, ...hids);            
            const thisPlace = Math.max(pageBottom, minHid);
            console.log("pageBottom", pageBottom);
            console.log("minHid", minHid);
            console.log("thisPlace", thisPlace);

            if (thisPlace > stopPoint) {
                const nextParams = currentParam.clone();
                nextParams.end = currentParam.end - SearchParams.pageSize - 1;
                nextParams.report("NEXT");
                nextPageParam$.next(nextParams);
            }
        }),
        mergeMap(([ results ]) => from(results))
    )
}

/**
 * Generates an observable for a single poll request for a given history id
 * @param {string} id History Id
 */
const buildRequest = historyId => of(historyId).pipe(
    getCachedHistory(),
    take(1),
    historyUpdate(),
    map(buildContentUrlForHistory),
    ajaxGet(),
    cacheContentArray()
)
