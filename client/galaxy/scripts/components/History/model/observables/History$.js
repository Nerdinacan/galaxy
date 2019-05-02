/**
 * Receives either a static id or an observable id and returns and observable
 * version of the contents of that history
 */

import { defer, from, merge, isObservable, of, combineLatest } from "rxjs";
import { pluck, tap, map, share, filter, mergeMap, mapTo, switchMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { histories$ } from "../db";
import { conformToSchema, historySchema } from "../schema";
import { log } from "../utils";



export function History$(history) {

    // input can be single value or a stream
    let history$ = isObservable(history) ? history : of(history);

    // return history$.pipe(
    //     mergeMap(h => combineLatest(histories$, of(h))),
    //     mergeMap(retrieveHistory),
    //     share()
    // );

    return combineLatest(histories$, history$).pipe(
        mergeMap(retrieveHistory),
        share()
    )
}


// pulls history either from cache or server (then caches)
function retrieveHistory(inputs) {
    
    let [ coll, history ] = inputs;

    // Look up cached version
    let cachedHistory = defer(() => from(checkCache(coll, history))).pipe(
        share()
    );

    let validCachedHistory = cachedHistory.pipe(
        filter(x => x !== null)
    );
        
    let invalidCachedHistory = cachedHistory.pipe(
        filter(x => x == null),
        mapTo(history),
        mergeMap(loadFreshHistory),
        map(processRawHistory),
        mergeMap(h => cacheHistory(coll, h))
    );
    
    // return whichever path yielded a document
    return merge(validCachedHistory, invalidCachedHistory).pipe(
        map(doc => doc.toJSON())
    )
}

async function checkCache(coll, history) {
    let lastUpdated = Date.parse(history.update_time);
    return await coll.findOne(history.id)
        .where('update_time').gte(lastUpdated)
        .exec();
}

function loadFreshHistory(history) {
    return ajax.getJSON(history.url);
}

function cacheHistory(coll, item) {
    return coll.atomicUpsert(item);
}


// massage inputs for indexDB here, tried to do it
// on a preInsert / preSave hook but ran into issues with rxdb
// not actually firing those hooks

const conformHistoryObj = conformToSchema(historySchema);

function processRawHistory(raw) {
    let newHistory = conformHistoryObj(raw);
    newHistory.update_time = Date.parse(raw.update_time);
    newHistory.isDeleted = raw.deleted;
    return newHistory;
}
