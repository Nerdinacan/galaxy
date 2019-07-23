/**
 * Generates a parameters observable for the provided history. Looks
 * at vuex store for changes. Updates self as history$ stream changes.
 */

import { tap, filter, pluck, map, distinctUntilChanged, debounceTime } from "rxjs/operators";
import { watchVuexSelector } from "utils/observable";
import { SearchParams } from "../SearchParams";
import store from "store";

export const Param$ = (history$, debounceDelay = 100, debug) => {
    return history$.pipe(
        filter(Boolean),
        pluck("id"),
        // build selector fn
        map(id => (_, getters) => getters["history/searchParams"](id)),
        watchVuexSelector(store),
        distinctUntilChanged(SearchParams.equals),
        debounceTime(debounceDelay),
        tap(p => {
            if (debug) p.report("Param$");
        })
    );
};
