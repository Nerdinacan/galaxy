import { pipe, throwError } from "rxjs";
import { filter, tap, map, catchError } from "rxjs/operators";
import { watchVuexSelector } from "utils/observable";


/**
 * Rxjs operator that takes a history id source stream and returns the current
 * user-provided parameters for that history id. Currently goes through the Vuex
 * store where it is stashed by the History component UI.
 *
 * intended source: Observable<historyId>
 */
export const historyParams = (config = {}) => {

    const {
        store,
        label = "historyParams",
        debug = false
    } = config;

    if (!store) {
        throw "Missing store in historyParams configuration";
    }

    return pipe(
        map(id => (_, getters) => getters["history/searchParams"](id)),
        watchVuexSelector(store),
        filter(Boolean),
        filter(p => p.validRange()),
        catchError(err => {
            console.warn("error in historyParams", err);
            return throwError(err);
        }),
        tap({
            next: p => {
                if (debug) p.report(label);
            },
            complete: () => {
                if (debug) {
                    console.log("historyParams complete");
                }
            }
        })
    );
}
