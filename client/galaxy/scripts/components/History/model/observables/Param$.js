/**
 * Generates a parameters observable for the current history. Looks directly
 * at store for changes. Updates self as history$ stream changes.
 */

import { tap, pluck, map, mergeMap, distinctUntilChanged, shareReplay } from "rxjs/operators";
import { SearchParams } from "../SearchParams";
import { watchVuexStore } from "./utils";

export const Param$ = (store, history$) => {
    return history$.pipe(
        pluck('id'),
        map(id => (_, getters) => getters["history/searchParams"](id)),
        mergeMap(selector => watchVuexStore(store, selector, SearchParams.equals)),
        distinctUntilChanged(SearchParams.equals),
        // tap(p => p.report("Param$ changed")),
        shareReplay(1)
    );
}
