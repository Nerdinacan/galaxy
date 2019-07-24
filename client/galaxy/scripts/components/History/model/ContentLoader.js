/**
 * Gets data into RxDB via user interaction (params and manual requests) or
 * through polling for server-side updates
 */

import { pipe, of } from "rxjs";
import { tap, share, distinct, map, filter, debounceTime, 
    buffer, takeUntil, take, retry } from "rxjs/operators";
import { watchVuexSelector } from "utils/observable";
import { createInputFunction, split, ajaxGet, poll } from "utils/observable";
import { getCachedHistory } from "caching";
import { getContentObservable, buildContentUrlForHistory, cacheContentArray, buildContentUrl } from "./Content";
import { historyUpdate } from "./History";
import store from "store";


export const stopPolling = createInputFunction();


export function ContentLoader(historyId) {

    const historyId$ = of(historyId);

    // watch vuex store for changes in params. Not sure we should
    // be storing params in store at all since they're really local
    // state to the history component
    const param$ = historyId$.pipe(
        getParamsFromHistoryId({
            store,
            debug: false,
            label: "source params"
        }),
        bufferParamRange({ 
            debug: false, 
            debounceDuration: 100
        }),
        share()
    );

    // content visible on the screen looks straight at the database
    // and returns anything matching the params, throw away start/end
    const content$ = param$.pipe(
        getContentObservable("obs", false)
    );

    // Do you have anything new for me for these parameters since
    // last time I asked?
    const manual$ = param$.pipe(
        segmentParams(),
        distinct(p => p.dateStoreKey),
        map(buildContentUrl()),
        ajaxGet(),
        cacheContentArray(),
        share()
    );

    const polling$ = historyId$.pipe(
        poll({
            debug: false,
            buildRequest,
            delayDuration: 5000,
            // TODO: maybe delay poll requests further if user pulled
            // another ajax request to avoid unnecessary requests?
            // triggers: manual$,
            // debounceDuration: 500,
        }),
        retry(1),
        takeUntil(stopPolling.$)
    );

    // subscribe to content observable
    function subscribe(/* success, error, complete */) {

        // direct observable, delivers what should be on the screen
        const contentSub = content$.subscribe.apply(content$, arguments);

        const manualSub = manual$.subscribe({
            // next: result => console.log("manual result", result),
            complete: () => console.log("manual complete"),
            error: err => console.warn("manual err", err)
        });

        const pollSub = polling$.subscribe({
            // next: result => console.log("polling result", result),
            complete: () => console.log("polling complete"),
            error: err => console.warn("polling err", err)
        });

        return contentSub.add(manualSub).add(pollSub);
    }

    return {
        subscribe
    };
}



// Poll for any recent changes to the history or its contents

const buildRequest = id => of(id).pipe(
    getCachedHistory(),
    take(1),
    historyUpdate(),
    map(buildContentUrlForHistory(true)),
    ajaxGet(),
    cacheContentArray()
)




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
        tap(p => debug ? p.report(label) : null)
    );
}



// emit a param representing the maximum range, max start/end of the params that
// passed through before we buffered

export const bufferParamRange = (config = {}) => src => {

    const { 
        debug = false, 
        debounceDuration = 500
    } = config;

    return src.pipe(
        tap(p => {
            if (debug) {
                p.report("bufferParamRange, preBuffer");
            }
        }),
        buffer(src.pipe(
            debounceTime(debounceDuration)
        )),
        // makes a single param interval with the highest/lowest
        // start/ends of all the buffered params
        map(bfr => bfr.reduce(amoebaInterval, null)),
        filter(Boolean),
        tap(result => {
            if (debug) {
                result.report("bufferParamRange");
            }
        })
    );
}

export const amoebaInterval = (acc, p) => {
    const result = acc === null ? p.clone() : acc.clone();
    result.start = Math.min(result.start, p.start);
    result.end = Math.max(result.end, p.end);
    return result;
}


// splits a param into distinct chunks by param pageSize
// reduces number of distinct calls to the server
export const segmentParams = debug => pipe(
    map(p => {
        const result = [];
        const chunk = p.pageSize;
        let top = p.end;
        do {
            const newP = p.clone();
            newP.end = Math.ceil(top / chunk) * chunk;
            newP.start = newP.end - chunk + 1;
            result.push(newP);
            top = newP.end - chunk;
        } while(top > p.start);
        return result;
    }),
    split(),
    tap(p => {
        if (debug) p.report("segmented params");
    })
);
