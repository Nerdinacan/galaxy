import { of, isObservable } from "rxjs";
import { switchMap, share, shareReplay } from "rxjs/operators";
import { poll } from "utils/observable";
import { cacheContent } from "caching";

import { historyParams } from "./historyParams";
import { contentObservable } from "./contentObservable";
import { loadManualRequests } from "./loadManualRequests";
import { buildPollRequest } from "./buildPollRequest";

import store from "store";

// import { create } from "rxjs-spy";
// import { tag } from "rxjs-spy/operators";
// window.spy = create();




/**
 * Returns a combined subscription to three observables:
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
    const historyId$ = id$.pipe(
        share()
    );

    // search params for this history
    // set by ContentList and ContentFilter components
    const param$ = historyId$.pipe(
        historyParams({
            store,
            debug: false
        }),
        shareReplay(1)
    );

    // observable that renders content in the list, just
    // stares directly at the db for this history
    const content$ = param$.pipe(
        contentObservable({
            debug: false
        })
    );

    // ajax requests instantiated by filtering/pagination
    const manual$ = param$.pipe(
        switchMap(p => of(p).pipe(
            loadManualRequests()
        )),
        cacheContent(false)
    );

    // periodic updates
    const polling$ = historyId$.pipe(
        poll({ buildPollRequest })
    );

    // group subscription
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

        return contentSub.add(manualSub); // .add(pollSub);
    }

    return {
        subscribe
    }
}
