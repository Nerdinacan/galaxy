/**
 * Operator that watches a vuex store when provided a source selector function
 * Output is an observable, source input should be the store.
 * Example:
 *   of(store).pipe(watchVuexSelector({ selector: yourFn }))
 */

import { pipe, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

export const watchVuexSelector = (config) => {
    const { selector, watchOptions = { immediate: true } } = config;
    return pipe(
        switchMap((store) => {
            return vuexChanges(store, selector, watchOptions);
        })
    );
};

// remove Vue observability nonsense

export const vuexChanges = (store, selector, watchOptions = { immediate: true }) => {
    return new Observable((obs) => {
        const callback = (result) => obs.next(result);
        return store.watch(selector, callback, watchOptions);
    });
};
