/**
 * Generates a parameters observable for the provided history. Looks
 * at vuex store for changes. Updates self as history$ stream changes.
 */

import { tap, pluck, map, mergeMap, distinctUntilChanged, shareReplay, scan } from "rxjs/operators";
import { SearchParams } from "../SearchParams";
import { watchVuexStore } from "./utils";

export const Param$ = (store, history$, debug) => {
    return history$.pipe(
        pluck('id'),
        // build selector fn
        map(id => (_, getters) => getters["history/searchParams"](id)),
        mergeMap(selector => watchVuexStore(store, selector)),
        distinctUntilChanged(SearchParams.equals),
        tap(p => {
            if (debug) p.report("Param$ changed");
        }),
        shareReplay(1)
    );
}
