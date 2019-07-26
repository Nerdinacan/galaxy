/**
 * Gets data into RxDB via user interaction (params and manual requests) or
 * through polling for server-side updates
 */

import { of } from "rxjs";
import { share, distinct, map, takeUntil, take } from "rxjs/operators";
import { createInputFunction, ajaxGet, poll } from "utils/observable";
import { getParamsFromHistoryId, segmentParams } from "./paramStreaming";
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
        // bufferParamRange({ 
        //     debug: true, 
        //     debounceDuration: 400
        // }),
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
        segmentParams(false),
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

        return contentSub.add(manualSub); // .add(pollSub);
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
