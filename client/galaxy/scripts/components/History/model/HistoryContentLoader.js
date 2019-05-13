/**
 * Assembles a content observable for a given history.
 * Can update parameters as needed.
 */
import { interval, isObservable, Subject, of, combineLatest } from "rxjs/index";
import { tap, debounceTime, distinctUntilChanged } from "rxjs/operators";
import { HistoryContent$ } from "./observables/HistoryContent$";
import { doUpdates } from "./observables/doUpdates";


export function HistoryContentLoader(history) {

    // just need one history, but could accept a dynamic one if desired
    const history$ = isObservable(history) ? history : of(history);

    // can set new parameters when user diddles with the controls
    // debounce and check for changes
    const paramSubject = new Subject();
    const setParams = newParams => paramSubject.next(newParams);
    const param$ = paramSubject.pipe(
        debounceTime(500),
        distinctUntilChanged()
    );

    // resulting contents
    const content$ = HistoryContent$(history$, param$);

    // Polling Updates
    // const clock$ = interval(4000);
    // const update$ = combineLatest(history$, param$, clock$).pipe(
    //     tap(doUpdates)
    // );


    // Subscribe to both initial update and polling
    
    let _sub;

    function subscribe() {
        _sub = content$.subscribe.apply(content$, arguments);
        // _sub.add(update$.subscribe());
        return _sub;
    }

    function unsubscribe() {
        if (_sub) {
            _sub.unsubscribe();
        }
    }

    return { 
        setParams,
        subscribe,
        unsubscribe
    };
}
