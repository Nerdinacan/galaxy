import { BehaviorSubject, defer, combineLatest, Observable, of } from "rxjs/index";
import { switchMap, filter, share, flatMap, tap } from "rxjs/operators";
import { ajax } from 'rxjs/ajax';
import store from "store";
import { ContentQueryParams } from "./ContentQueryParams";

import { stashHistory } from "./database";



// Transforms store current history into an observable
// I'm still trying to justify the existence of the store
// This could just as easily be a single observable value

// export const CurrentHistoryFromStore = defer(() => {
//     const watchOptions = { deep: true, immediate: true };

//     return new Observable(sub => {
//         return store.watch(
//             state => state.history.current, 
//             currentHistory => sub.next(currentHistory),
//             watchOptions
//         );
//     })
// });


// from the server

export const CurrentHistory = defer(() => {
    let url = "/history/current_history_json";
    return ajax.getJSON(url);
}).pipe(share());


// load history object, which is mysteriously different
// from the current_history_json
// api/histories/ba751ee0539fff04

export const CurrentHistoryObject = 
    CurrentHistory.pipe(
        filter(history => history.url),
        switchMap(history => ajax.getJSON(history.url)),
        share()
    );

// try to stash cho
CurrentHistoryObject.subscribe(stashHistory);


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
