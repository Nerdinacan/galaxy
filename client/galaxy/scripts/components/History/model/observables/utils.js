import { Subject, Observable, from } from "rxjs";
import { tap, map, mergeMap, filter, scan, repeatWhen, delay } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { prependPath } from "utils/redirect";


/**
 * Tap/console.log
 * @param {any} label 
 */
export const log = label => source => {
    return source.pipe(
        tap(o => console.log(label, o))
    )
}


/**
 * Tap/console.warn
 * @param {any} label 
 */
export const warn = label => source => {
    return source.pipe(
        tap(o => console.warn(label, o))
    )
}


/**
 * Split array result into individual items
 */
export const split = () => source => {
    return source.pipe(
        mergeMap(from)
    );
}


/**
 * Emit the first item from an array result
 */
export const firstItem = () => source => {
    return source.pipe(
        filter(list => list.length > 0),
        map(list => list[0])
    )
}


/**
 * Run a scan against incoming objects, and/subtract to a map
 * keyed by the configured keyfield property
 * @param {string} keyField
 */
export const scanToMap = keyField => source$ => {
    return source$.pipe(
        scan((resultMap, { operation, item }) => {
            const key = item[keyField];
            switch (operation) {
                case "set":
                    resultMap.set(key, item);
                    break;
                case "delete":
                    resultMap.delete(key);
                    break;
            }
            return resultMap;
        }, new Map())
    );
}


/**
 * Simple ajax load passthrough, applies generic ajax handling. This only exists
 * so we can dress it up with standard error-retry and data preparation features.
 */
export const ajaxGet = () => url$ => {
    return url$.pipe(
        map(prependPath),
        mergeMap(ajax.getJSON)
    )
}


/**
 * Default strict equality comparitor
 * @param {any} a 
 * @param {any} b 
 */
const strictEquality = (a, b) => (b === undefined) ? false : a === b;


/**
 * Converts a watched expression against a vuex store into
 * an observable
 * @param {object} store
 * @param {function} selector
 * @param {object} opts
 */
export function watchVuexStore(store, selector, opts = { immediate: true }) {
    return new Observable(subscriber => {
        const handler = result => subscriber.next(result);
        return store.watch(selector, handler, opts);
    });
}


/**
 * Creates a function that updates an internal observable subject for manual
 * manipulation of stream contents. Access to the internal observable is
 * through the .$ property of the resulting function.
 */
export function createInputFunction() {
    const buffer = new Subject();
    const updateFn = buffer.next.bind(buffer);
    updateFn.$ = buffer;
    return updateFn;
}


/**
 * Generic polling operator
 * @param {integer} pollDelay
 */
export const poll = pollDelay => source => {
    return source.pipe(
        repeatWhen(done => {
            return done.pipe(delay(pollDelay));
        })
    );
}
