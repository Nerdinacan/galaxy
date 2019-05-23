import { from, combineLatest, of } from "rxjs";
import { tap, map, mergeMap, filter, scan } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { prependPath } from "utils/redirect";


// Logging

export const log = label => source => {
    return source.pipe(
        tap(o => console.log(label, o))
    )
}

export const warn = label => source => {
    return source.pipe(
        tap(o => console.warn(label, o))
    )
}


// split observable array result into individual items and
// emit as individuals

export const split = () => source => {
    return source.pipe(
        mergeMap(from)
    );
}


// Emit the First item from an array result

export const firstItem = () => source => {
    return source.pipe(
        filter(list => list.length > 0),
        map(list => list[0])
    )
}


// "withLatestFrom" not behaving as expected
// with rxdb observables, think it might be a flaw
// in rxdb, but this works

export const withLatestFromDb = dbo$ => source$ => {
    return source$.pipe(
        mergeMap(o => combineLatest(of(o), dbo$)),
    );
}


// Cache stream of objects in rxdb collection

export const cacheInLocalDb = collection$ => source$ => {
    return source$.pipe(
        withLatestFromDb(collection$),
        mergeMap(cacheItem)
    );
}

export const deleteFromLocalDb = collection$ => source$ => {
    return source$.pipe(
        withLatestFromDb(collection$),
        mergeMap(wipeItem)
    )
}

async function cacheItem([ item, collection ]) {
    return await collection.upsert(item);
}

async function wipeItem([ item, collection ]) {
    const keyField = collection.schema.primaryPath;
    const pKey = item[keyField];
    const query = collection.find().where(keyField).eq(pKey);
    return await query.remove();
}


// Custom operator: runs a scan against incoming object/operations
// to add or subtract incoming values from a running map. Resulting
// map is keyed by configured keyField property name

export const scanToMap = keyField => source$ => {
    return source$.pipe(
        scan((mapping, { operation, item }) => {
            const key = item[keyField];
            switch(operation) {
                case "set":
                    mapping.set(key, item);
                    break;
                case "delete":
                    mapping.delete(key);
                    break;
            }
            return mapping;
        }, new Map())
    );
}


// simple ajax get request as an observable

export const load = () => source => {
    return source.pipe(
        map(prependPath),
        mergeMap(ajax.getJSON)
    )
}
