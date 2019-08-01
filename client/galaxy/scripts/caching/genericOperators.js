import { of, combineLatest, pipe, from, defer } from "rxjs";
import { tap, map, filter, mergeMap, retryWhen, catchError, pluck, take } from "rxjs/operators";
import { tag } from "rxjs-spy/operators";




/**
 * There's something fishy about RxDB's collection objects, and they fail when
 * used with a standard combineLatest/withLatest from, but seem to work when
 * explicitly invoked using this method. Use this when you would normally use
 * withLatestFrom on a database collection.
 *
 * I think this should work, but it hangs for some reason
 * export const withLatestFromDb = withLatestFrom;
 *
 * @param {*} rxDbCollection$
 */
export const withLatestFromDb = rxDbCollection$ =>
    mergeMap(src => combineLatest(of(src), rxDbCollection$))


/**
 * Creates a function that returns a promise from an observable operator
 * for interacting with non-observable code.
 * @param {*} operator caching operator
 * @param  {...any} config Config for the operator
 */
export const createPromiseFromOperator = (operator, ...config) => item => {
    const src$ = of(item);
    return src$.pipe(operator(...config)).toPromise();
}


/**
 * Retrieves item from indexDB collection given an
 * observable primary key as a source observable
 * @param {Observable<RxCollection>} collection$
 */
export const getItem = (collection$, debug = false) => pipe(
    filter(Boolean),
    getItemQuery(collection$, debug),
    mergeMap(query => query.$)
)

export const getItemQuery = (collection$, debug = false) => pipe(
    withLatestFromDb(collection$),
    tap(([ key, coll ]) => {
        if (debug) {
            console.log("getCachedItem", coll.name, key)
        }
    }),
    map(([ key, coll ]) => {
        const keyField = coll.schema.primaryPath;
        return coll.findOne().where(keyField).eq(key);
    })
)


/**
 * Cache object in rxdb collection
 * @param {Observable<RxCollection>} collection$
 */
export const setItem = (collection$, debug = false) => pipe(
    withLatestFromDb(collection$),
    mergeMap(([ item, coll ]) => {
        return from(coll.upsert(item)).pipe(
            retryWhen(err => err.pipe(
                filter(err => err.name == "conflict"),
                tag('setItem 409 error'),
                take(1)
            )),
            catchError((err, caught) => {
                console.warn("setItem upsert error", err);
                return of(null);
            })
        )
    }),
    filter(Boolean)
)


/**
 * Delete object from collection
 * @param {Observable<RxCollection>} collection$
 */
export const deleteItem = collection$ => pipe(
    withLatestFromDb(collection$),
    mergeMap(async ([ item, coll ]) => {
        const keyField = coll.schema.primaryPath;
        const pKey = item[keyField];
        const query = coll.find().where(keyField).eq(pKey);
        return await query.remove();
    })
)

