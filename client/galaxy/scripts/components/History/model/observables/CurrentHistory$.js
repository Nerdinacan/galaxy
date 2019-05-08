import { defer, merge, Subject } from "rxjs/index";
import { tap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { log } from "../utils";


// Initial ajax call when app loads

const InitialLoad$ = defer(loadCurrentHistory);

export function loadCurrentHistory() {
    let url = "/history/current_history_json";
    return ajax.getJSON(url);
}


// Manual switch

const updateHistory$ = new Subject();

export function setCurrentHistory(newHistory) {
    updateHistory$.next(newHistory);
}


// Main observable

export const CurrentHistory$ = merge(InitialLoad$, updateHistory$);
