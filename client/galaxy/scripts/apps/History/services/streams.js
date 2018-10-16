import { of, BehaviorSubject } from "rxjs";
import { switchMap, filter } from "rxjs/operators";
import { getHistories, getHistoryById, getHistoryContents } from "./historyServices";
export { getHistoryById as getHistory } from "./historyServices";

// All histories
export const histories = getHistories();

// current history id
const currentHistoryId = new BehaviorSubject(null);
export const setCurrentHistory = id => currentHistoryId.next(id);

// current history observable
export const currentHistory = currentHistoryId.pipe(
    filter(Boolean),
    switchMap(getHistoryById)
);

// current history contents
export const historyContents = history => {
    return of(history).pipe(
        switchMap(h => getHistoryContents(h))
        // map(contents => {
        //     history.loadContents(contents);
        //     return history;
        // })
    );
};
