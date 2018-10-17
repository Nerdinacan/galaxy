import { of, BehaviorSubject } from "rxjs";
import { switchMap } from "rxjs/operators";
import { getHistoryById } from "./historyServices";

/**
 * Observable for the active history object
 */
const currentHistoryId = new BehaviorSubject(null);

/**
 * Sets currently selected history by id
 * @param {string} id New history id
 */
export const setCurrentHistoryId = id => currentHistoryId.next(id);

/**
 * Observable of the current history object
 * @returns Observable History object
 */
export const currentHistory = currentHistoryId.pipe(
    switchMap(id => {
        return id ? getHistoryById(id) : of(null);
    })
);
