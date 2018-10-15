import { BehaviorSubject } from "rxjs";
import { map, switchMap, filter } from "rxjs/operators";
import { History, HistorySummary } from "./index";
import { getHistories, getHistoryById } from "./historyServices";

// All histories
export const histories = getHistories().pipe(
    map(list => list.map(HistorySummary.hydrate))
);

// Load one history
export const getHistory = id => getHistoryById(id).pipe(map(History.hydrate));

// current history id
const currentHistoryId = new BehaviorSubject(null);
export const setCurrentHistory = id => currentHistoryId.next(id);

// current history observable
export const currentHistory = currentHistoryId.pipe(
    filter(Boolean),
    switchMap(getHistory),
    map(History.hydrate)
);
