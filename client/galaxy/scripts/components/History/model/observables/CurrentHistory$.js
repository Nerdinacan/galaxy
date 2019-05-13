import { defer, merge, Subject } from "rxjs";
import { ajax } from "rxjs/ajax";



// Initial ajax call when app loads

const InitialLoad$ = defer(loadCurrentHistory);

export function loadCurrentHistory() {
    const url = "/history/current_history_json";
    return ajax.getJSON(url);
}


// Manual switch

const updateHistory$ = new Subject();

export function setCurrentHistory(newHistory) {
    updateHistory$.next(newHistory);
}


// Main observable

export const CurrentHistory$ = merge(
    InitialLoad$, 
    updateHistory$
)
