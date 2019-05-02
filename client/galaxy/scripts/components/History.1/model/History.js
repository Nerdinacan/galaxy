/**
 * Receives either a static id or an observable id and returns and observable
 * version of the contents of that history
 */

import { from, merge, isObservable, of, combineLatest } from "rxjs/index";
import { map, share, filter, mergeMap, mapTo, switchMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { histories } from "./database";
import { conformToSchema, historySchema } from "./schema";


export function History$(rawHistory) {

    // input can be single value or a stream
    let input$ = isObservable(rawHistory) ? rawHistory : of(rawHistory);

    // compare input history to cached history
    return combineLatest(histories, input$).pipe(
        mergeMap(retrieveHistory),
        share()
    )
}

// pulls history either from cache or server (then caches)
function retrieveHistory(inputs) {
    
    let [ historyCollection, history ] = inputs;

    // Look up cached version
    let cachedHistory = from(checkCache(inputs)).pipe(
        share()
    );

    // requested history items that were not valid in the cache
    // take the nulls from the cache query and trigger a new ajax query against the server
    let retrievedHistory = cachedHistory.pipe(
        filter(x => x == null),
        mapTo(history.url),
        switchMap(ajax.getJSON),
        map(processRawHistory),
        mergeMap(h => from(historyCollection.atomicUpsert(h)))
    );
    
    // return whichever path yielded a document
    return merge(
        cachedHistory.pipe(filter(Boolean)),
        retrievedHistory
    );
}

function checkCache([ collection, history ]) {
    let lastUpdated = Date.parse(history.update_time);
    return collection.findOne(history.id)
        .where('update_time').gte(lastUpdated)
        .exec();
}

const conformHistoryObj = conformToSchema(historySchema);

// massage inputs for indexDB here, tried to do it
// on a preInsert / preSave hook but ran into issues
function processRawHistory(raw) {
    let newHistory = conformHistoryObj(raw);
    newHistory.update_time = Date.parse(raw.update_time);
    newHistory.isDeleted = raw.deleted;
    return newHistory;
}
