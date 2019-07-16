/**
 * Subscribes to a live content query observable (Content$) and a pollling
 * update (PollUpdate$) that updates the local database with changed data
 * corresponding to the history and parameters passed in.
 */

import { of } from "rxjs";
import { tap, share, first } from "rxjs/operators";
import { getCachedHistory } from "./CachedData";
import { PollUpdate$ } from "./PollUpdate$";
import { Param$ } from "./Param$";
import { localContentObservable } from "./Content$";
import store from "store";


export function ContentLoader(historyId) {

    // just one history
    const history$ = of(historyId).pipe(
        getCachedHistory(),
        first(),
        share()
    );
    
    // watch vuex store for changes in params
    const param$ = Param$(store, history$);

    // subscribe to content observable
    function subscribe(/* success, error, complete */) {
        const content$ = param$.pipe(
            localContentObservable("visible content", false)
        );
        const sub = content$.subscribe.apply(content$, arguments);
        // return sub.add(subscribeToPolling());
        return sub;
    }

    // piggy-back subscription to polling
    function subscribeToPolling() {
        const update$ = PollUpdate$(history$, param$);
        return update$.subscribe(
            null, // result => console.log("poll result", result),
            error => console.warn("poll error", error),
            () => console.log("poll complete")
        );
    }

    return {
        subscribe
    };
}
