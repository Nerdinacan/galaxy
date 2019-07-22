/**
 * Gets data into RxDB via user interaction (params and manual requests) or
 * through polling for server-side updates
 */

import { of } from "rxjs";
import { map, share, takeUntil } from "rxjs/operators";
import { createInputFunction, poll } from "utils/observable";
import { getCachedHistory } from "caching";
import { SearchParams } from "../SearchParams";
import { Param$ } from "./Param$";
import { getContentObservable, loadAndCacheContentForParams } from "./Content";
import { historyUpdate } from "./History";


export const stopPolling = createInputFunction();


export function ContentLoader(historyId) {

    // just one history
    const history$ = of(historyId).pipe(
        getCachedHistory()
    );

    // watch vuex store for changes in params. Not sure we should
    // be storing params in store at all since they're really local
    // state to the history component
    const param$ = Param$(history$, 200, true).pipe(
        share()
    );

    // content visible on the screen looks straight at the database
    // and returns anything matching the params, throw away start/end
    const content$ = param$.pipe(
        map(p => p.clone().removeLimits()),
        getContentObservable()
    )


    // Explicitly load requested content based on changing params

    const manual$ = param$.pipe(
        loadAndCacheContentForParams(false),
        share()
    )


    // Poll for any recent changes to the history or its contents

    const buildRequest = history => of(history).pipe(
        historyUpdate(),
        map(h => SearchParams.entireHistory(h)),
        loadAndCacheContentForParams()
    )

    const polling$ = history$.pipe(
        takeUntil(stopPolling.$),
        poll({ buildRequest, reTriggers: manual$ })
    )


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

