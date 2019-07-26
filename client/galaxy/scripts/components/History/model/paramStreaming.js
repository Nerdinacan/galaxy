import { pipe } from "rxjs";
import { tap, map, filter } from "rxjs/operators";
import { watchVuexSelector, split } from "utils/observable";
import { SearchParams } from "./SearchParams";


/**
 * Generates a parameters observable operator for the source history stream. Looks
 * at vuex store for changes. Updates self as history$ stream changes.
 */

export const getParamsFromHistoryId = (config = {}) => {

    const { 
        store,
        label = "params", 
        debug = false
    } = config;

    return pipe(
        map(id => (_, getters) => getters["history/searchParams"](id)),
        watchVuexSelector(store),
        filter(p => p.validRange()),
        tap(p => debug ? p.report(label) : null)
    );
}


/**
 * Splits a parameter into multiple discrete parameters by pageSize, reduces
 * number of separate calls to the api and lets us cache them
 * @param {boolean} debug 
 */
export const segmentParams = debug => pipe(
    tap(p => {
        if (debug) {
            console.group("Segmenting...", p.end, p.start);
        }
    }),
    map(p => {

        const segments = [];
        const chunk = SearchParams.pageSize;

        let top = p.end;
        do {
            const newP = p.clone();
            newP.end = Math.ceil(top / chunk) * chunk;
            newP.start = newP.end - chunk + 1;
            segments.push(newP);
            top = newP.end - chunk;
        } while(top > p.start);

        return segments;
    }),
    tap(arrP => {
        if (debug) {
            arrP.forEach(p => p.report("segmented result"));
            console.groupEnd();
        }
    }),
    split()
)


//#region Unused
/*
// emit a param representing the maximum range, max start/end of the params that
// passed through before we buffered
// Possibly unnecessary, I have the component buffering the endpoints now.

export const bufferParamRange = (config = {}) => src => {

    const { 
        debug = false, 
        debounceDuration = 500
    } = config;

    return src.pipe(
        tap(p => {
            if (debug) {
                console.log("Buffering params...");
                p.report("bufferParamRange, preBuffer");
            }
        }),
        buffer(src.pipe(
            debounceTime(debounceDuration)
        )),
        // makes a single param interval with the highest/lowest
        // start/ends of all the buffered params
        map(bfr => bfr.reduce(amoebaInterval, null)),
        filter(Boolean),
        tap(result => {
            if (debug) {
                result.report("bufferParamRange final");
            }
        })
    );
}


export const amoebaInterval = (acc, p) => {
    const result = acc === null ? p.clone() : acc.clone();
    result.end = Math.max(result.end, p.end);

    if (p.start == 0) {
        result.start = result.end - (2 * SearchParams.pageSize);
    } else {
        result.start = Math.min(result.start, p.start);
    }

    return result;
}
*/
//#endregion