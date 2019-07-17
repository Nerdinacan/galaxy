/**
 * Operator that watches a vuex store given a source selector function
 */

import { Observable, pipe } from "rxjs";
import { switchMap } from "rxjs/operators";

export const watchVuexSelector = (store, watchOpts = { immediate: true }) => pipe(
    switchMap(selector => {
        return new Observable(subscriber => {
            const handler = result => subscriber.next(result);
            return store.watch(selector, handler, watchOpts);
        });
    })
);
