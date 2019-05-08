import { defer } from "rxjs";
import { ajax } from "rxjs/ajax";

export const HistoryList$ = defer(loadHistories);

export function loadHistories() {
    let url = "/api/histories";
    return ajax.getJSON(url);
}
