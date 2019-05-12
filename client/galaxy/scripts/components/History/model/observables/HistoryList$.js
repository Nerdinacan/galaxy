import { defer } from "rxjs/index";
import { ajax } from "rxjs/ajax";

export const HistoryList$ = defer(getHistories);

export function getHistories() {
    let url = "/api/histories?view=detailed";
    return ajax.getJSON(url);
}
