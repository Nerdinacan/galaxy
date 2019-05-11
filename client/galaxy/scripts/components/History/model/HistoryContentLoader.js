/**
 * Assembles a content observable for a given history.
 * Can update parameters as needed.
 */
import { isObservable, Subject, of } from "rxjs/index";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { HistoryContent$ } from "./observables/HistoryContent$";

export function HistoryContentLoader(history) {

    // just need one history, but could accept a dynamic one if desired
    const history$ = isObservable(history) ? history: of(history);

    // can set new parameters when user diddles with the controls
    // debounce and check for changes
    const paramSubject = new Subject();
    const setParams = newParams => paramSubject.next(newParams);
    const param$ = paramSubject.pipe(
        debounceTime(200),
        distinctUntilChanged()
    );

    // resulting contents, subscribe to this thing to get your results
    const content$ = HistoryContent$(history$, param$);

    return { setParams, content$ };
}
