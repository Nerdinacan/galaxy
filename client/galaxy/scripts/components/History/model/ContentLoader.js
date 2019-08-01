import { of, Subject, merge, isObservable, from, pipe } from "rxjs";
import { filter, mergeMap, switchMap, tap, pluck, share, map, take, shareReplay, takeUntil, withLatestFrom } from "rxjs/operators";
import { createInputFunction, ajaxGet, poll, distinctInSet, watchVuexSelector } from "utils/observable";
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
    const content$ = param$.pipe(getContentObservable());
    
    // ajax requests instantiated by filtering/pagination
    const manual$ = param$.pipe(
        switchMap(p => of(p).pipe(loadManualRequests())),
        cacheContent(false)
    );

    // periodic updates
    const polling$ = historyId$.pipe(
        poll({ buildPollRequest }),
        takeUntil(stopPolling.$)
    );

    function subscribe(/* next, error, complete */) {
        
        // Standard subscribe handlers apply to content observable,
        // but we also subscribe to the manual/polling observables
        // to keep them running while the history panel is open
        const contentSub = content$.subscribe.apply(content$, arguments);

        // when params change, loads next page/params
        const manualSub = manual$.subscribe({
            complete: () => console.log("manual complete"),
            error: err => console.warn("manual err", err)
        });

        // catches non-ui updates to history. Server side changes, etc.
        const pollSub = polling$.subscribe({
            complete: () => console.log("polling complete"),
            error: err => console.warn("polling err", err)
        });

        return contentSub.add(manualSub).add(pollSub);
    }

    return { subscribe }
}


/**
 * Generates a parameters observable operator for the source history stream. Looks
 * at vuex store for changes. Updates self as history$ stream changes.
 */
export const getParamsFromHistoryId = (config = {}) => {

    const { 
        store,
        label = "params", 
        debug = false
    } = config;

    return pipe(
        map(id => (_, getters) => getters["history/searchParams"](id)),
        watchVuexSelector(store),
        filter(Boolean),
        filter(p => p.validRange()),
        tap(p => debug ? p.report(label) : null)
    );
}


/**
 * Operator does ajax requests matching source SearchParam object. Splits large
 * requests into smaller ajax chunks based on SearchParams.pageSize, avoids
 * returning duplicate requests
 */

// keeps a list of all previously requested urls since page-load
// avoids duplicate requests. Clears on page refresh.
const sessionRequests = new Set();

const loadManualRequests = () => param$ => {

    const nextPageParam$ = new Subject();

    const stopPoint$ = param$.pipe(
        pluck('start')
    );

    const input$ = merge(param$, nextPageParam$).pipe(
        map(p => p.chunkEnd())
    )

    const result$ = input$.pipe(
        pluck('contentUrl'),
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
 * Generates an observable for a single poll request for a given history id
 * @param {string} id History Id
 */
const buildPollRequest = historyId => of(historyId).pipe(
    getCachedHistory(),
    take(1),
    historyUpdate(),
    map(buildContentUrlForHistory),
    ajaxGet(),
    cacheContentArray()
)
