import { defer } from "rxjs";
import { ajax } from "rxjs/ajax";

export const CurrentHistory$ = defer(loadCurrentHistory);

export function loadCurrentHistory() {
    let url = "/history/current_history_json";
    return ajax.getJSON(url);
}
