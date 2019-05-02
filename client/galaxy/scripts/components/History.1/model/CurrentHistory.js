import { concat, Observable, defer } from "rxjs/index";
import { take, distinctUntilChanged, tap, share, filter } from "rxjs/operators";
import { ajax } from 'rxjs/ajax';
import store from "store";



// initial load from server

const CurrentHistoryInitialLoad = 
    defer(loadCurrentHistory).pipe(
        // map(processHistory),
        tap(storeHistory),
        take(1)
    );

function loadCurrentHistory() {
    let url = "/history/current_history_json";
    return ajax.getJSON(url);
}

// function processHistory(history) {
//     let { id, update_time, contents_url } = history;
//     return { id, update_time, contents_url };
// }

function storeHistory(history) {
    store.commit("setCurrentHistory", history)
}


// From Vuex, captures manual switches initated from store

const CurrentHistoryFromVuex = new Observable(subscriber => {
    let watchOptions = { deep: true, immediate: true };
    return store.watch(
        state => state.history.currentHistory,
        history => subscriber.next(history),
        watchOptions
    );
})

export const CurrentHistory = 
    concat(CurrentHistoryInitialLoad, CurrentHistoryFromVuex).pipe(
        filter(Boolean),
        distinctUntilChanged(),
        share()
    );
