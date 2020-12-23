/**
 * Monitors a query selector on the cache and collects the running result into a
 * single collection that is emitted from the observable
 */
import { of } from "rxjs";
import { scan, switchMap, map } from "rxjs/operators";
import { monitorQuery } from "../db/monitorQuery";
import { createAggregator, newContainer } from "./mapAggregation";

// prettier-ignore
export const aggregateQuery = (cfg = {}) => (pouchRequest$) => {
    const { keyField = "_id" } = cfg;
    const getKey = (doc) => doc[keyField];
    const aggregator = createAggregator({ getKey });

    return pouchRequest$.pipe(

        // start a new aggregate container every time the request changes
        // as the changes come in, throw them at the container, which is
        // a map in this case
        switchMap((req) => {
            return of(req).pipe(
                monitorQuery(cfg), 
                scan(aggregator, newContainer())
            );
        }),

        // convert map to simple array (no particular order)
        // it's up to you to sort it if you need it
        map((currentResult) => [...currentResult.values]),
    );
};
