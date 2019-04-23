import { defer, combineLatest, of, from } from "rxjs/index";
import { pluck, share, tap, mergeMap, map, distinctUntilChanged, 
    withLatestFrom, switchMap } from "rxjs/operators";
import { ajax } from 'rxjs/ajax';
import { historyCollection } from "./database";
// import store from "store";
import { History } from "./History";


// CurrentHistory load/cache observable

// initial load
// TODO: build simpler initial load with only
// id, last updated date (for cache validation)
// and maybe operation state variables

export const loadCurrentHistory = 
    () => ajax.getJSON("/history/current_history_json");

export const CurrentHistoryFromServer = 
    defer(loadCurrentHistory).pipe(share());


// pluck out id, this is intentionally separated
// so we can merge in changes from the store later
// where I'm probably only going to store the current_id itself

export const CurrentHistoryId =
    CurrentHistoryFromServer.pipe(pluck('id'));


// retrieves cached history obj from indexDB by id

export const retriveHistoryById = 
    ([id, collection]) => collection.findOne(id).exec();

export const CurrentHistoryFromCache = 
    combineLatest(CurrentHistoryId, historyCollection).pipe(
        mergeMap(retriveHistoryById),
        map(props => props ? History.create(props) : null)
    );


// validate cached version against server updated-date and selection.
// If too old, retrieve the full version from the server and cache

export const cacheIsValid = (server, cached) => {
    let stale = !cached 
        || (server.id != cached.id) 
        || (server.updateTime > cached.updateTime);
    return !stale;
}

export const validateCachedData = ([ serverHistory, storageHistory, collection ]) => {
    let valid = cacheIsValid(serverHistory, storageHistory);
    return valid ? of(storageHistory) : cacheHistory(collection, serverHistory);
}

export const cacheHistory = (collection, history) => {
    return from(collection.upsert(history.export()))
        .pipe(map(hdoc => History.create(hdoc.toJSON())))
}

export const CurrentHistory = 
    combineLatest(
        CurrentHistoryFromServer, 
        CurrentHistoryFromCache, 
        historyCollection
    ).pipe(
        switchMap(validateCachedData)
    );


// History Contents


/**
 * http://localhost:8080/api/histories?keys=id,contents_url,update_time
 */


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