/**
 * Operator that watches a vuex store given a source selector function
 */

import { Observable, pipe } from "rxjs";
import { switchMap } from "rxjs/operators";

export const watchVuexSelector = (store, watchOptions = { immediate: true }) => pipe(
    switchMap(selectorFn => {
        return new Observable(subscriber => {
            const callback = result => subscriber.next(result);
            return store.watch(selectorFn, callback, watchOptions);
        });
    })
);
