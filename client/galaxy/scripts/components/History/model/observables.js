import { defer, combineLatest, of, from } from "rxjs/index";
import { pluck, share, tap, mergeMap, map, distinctUntilChanged, withLatestFrom, switchMap } from "rxjs/operators";
import { ajax } from 'rxjs/ajax';
import { historyCollection } from "./database";
// import store from "store";
import { History } from "./History";


/**
 * 1. Get current history id from state,
 * 2. Try to load history from indexDB
 * 3. Send request to server for that history
 * 4. Merge results 2,3 and use id + last-updated date to determine cache-coldness
 * 5. Store history in indexDB
 * 6. Expose as current History
 */

/**
 * Call current_history_json
 * Check indexdb
 * Validate cache
 * if distinct value expose as current history
 */


// Assemble current history object and check cache freshness by comparing
// updated dates

const CurrentHistoryFromServer = 
    defer(loadCurrentHistory).pipe(
        map(History.create),
        share()
    );

const CurrentHistoryFromStorage = 
    combineLatest(
        CurrentHistoryFromServer.pipe(pluck('id')), 
        historyCollection
    ).pipe(
        mergeMap(([id, collection]) => collection.findOne(id).exec()),
        map(props => props ? History.create(props) : null)
    );

export const CurrentHistory = 
    combineLatest(
        CurrentHistoryFromServer, 
        CurrentHistoryFromStorage, 
        historyCollection
    ).pipe(
        switchMap(checkCache)
    );



function loadCurrentHistory() {
    return ajax.getJSON("/history/current_history_json");
}

function checkCache([serverHistory, storageHistory, collection]) {
    let stale = !storageHistory 
        || (serverHistory.id != storageHistory.id) 
        || (serverHistory.updateTime > storageHistory.updateTime);
    return stale ? cacheHistory(collection, serverHistory) : of(storageHistory);
}

function cacheHistory(collection, history) {
    return from(collection.upsert(history.export()))
        .pipe(map(hdoc => History.create(hdoc.toJSON())))
}

/*
const CurrentHistoryId = defer(() => {
    const watchOptions = { deep: true, immediate: true };

    return new Observable(sub => {
        return store.watch(
            state => state.history.currentHistoryId, 
            id => sub.next(id),
            watchOptions
        );
    })
})

const FromStorage = CurrentHistoryId.pipe(
    mergeMap(retrieveStoredHistoryById)
)

export const CurrentHistory = merge(FromStorage, FromServer).pipe(
    tap(storeHistory),
    share()
)


const DefaultHistory = of(new History());



const FromServer = CurrentHistoryId.pipe(
    mergeMap(id => ajax())
)


const historyFresh = (p,q) => {
    // check to see if cached history is too old
    return true;
}

export const CurrentHistory = merge(
    CurrentHistoryFromIndexDb, 
    CurrentHistoryFromServer
).pipe(distinctUntilChanged(historyFresh));



// load history object, which is mysteriously different
// from the current_history_json
// api/histories/ba751ee0539fff04

export const CurrentHistoryObject = 
    CurrentHistory.pipe(
        filter(history => history.url),
        switchMap(history => ajax.getJSON(history.url)),
        share()
    );

const insertSub = combineLatest(CurrentHistoryObject, historyCollection)
    .subscribe(([history, coll]) => {
        let { id, name } = history;
        coll.upsert({ id, name }).then(doc => {
            console.log(doc);
        })
    })

const dumpSub = historyCollection.$.subscribe(change => {
    console.log("change", change);
})

// Content query parameters
const QueryParams = new BehaviorSubject(new ContentQueryParams());
export const setQueryParams = params => QueryParams.next(params);

// load contents listing
export const CurrentHistoryContents = 
    combineLatest(CurrentHistoryObject, QueryParams)
        .pipe(
            switchMap(([history, params]) => {
                return ajax.getJSON(history.contents_url);
            })
        );
*/