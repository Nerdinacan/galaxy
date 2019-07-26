import { of, combineLatest, pipe, from, defer } from "rxjs";
import { tap, filter, mergeMap, retryWhen, catchError, pluck, take, finalize } from "rxjs/operators";



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
    withLatestFromDb(collection$),
    tap(([ key, coll ]) => {
        if (debug) {
            console.log("getCachedItem", coll.name, key)
        }
    }),
    mergeMap(([ key, coll ]) => {
        const keyField = coll.schema.primaryPath;
        const query = coll.findOne().where(keyField).eq(key);
        return query.$;
    })
)


/**
 * Cache object in rxdb collection
 * @param {Observable<RxCollection>} collection$
 */
export const setItem = (collection$, debug = false) => pipe(
    withLatestFromDb(collection$),
    mergeMap(([ item, coll ]) => {

        if (debug) {
            console.groupCollapsed("CACHING", coll.name, item.id, item.name);
            console.log("item", item);
            console.groupEnd();
        }

        const save$ = defer(() => {
            const p = coll.upsert(item);
            return from(p);
        });
        
        return save$.pipe(
            retryWhen(err => err.pipe(
                pluck('status'),
                filter(status => status == 409),
                tap(err => {
                    if (debug) {
                        console.warn("setItem upsert 409 error");
                        console.log(item);
                        console.log(err);
                    }
                }),
                take(1)
            )),
            catchError(err => {
                console.warn("setItem upsert error", err);
                return of(null);
            }),
            finalize(() => {
                if (debug) {
                    console.groupEnd();
                }
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
