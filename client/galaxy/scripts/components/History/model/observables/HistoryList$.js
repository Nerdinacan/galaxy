import { defer } from "rxjs";
import { ajax } from "rxjs/ajax";

export const HistoryList$ = defer(getHistories);

export function getHistories() {
    const url = "/api/histories/?view=dev-detailed";
    return ajax.getJSON(url);
}
