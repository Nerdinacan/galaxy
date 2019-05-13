import { isObservable, Subject, of, combineLatest } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { HistoryContent$ } from "./HistoryContent$";
import { PollUpdate$ } from "./PollUpdate$";


export function ContentLoader(history) {

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

    // load initial contents
    const content$ = HistoryContent$(history$, param$);
    
    // live updates
    const update$ = PollUpdate$(history$, param$);


    // Subscribe to both content query and update processor
    
    let _sub;

    function subscribe() {

        console.log("subscribing");

        // main result is a content query of the database
        let mainSub = content$.subscribe.apply(content$, arguments);

        let pollSub = update$.subscribe(
            null,
            error => {
                console.warn("poll error", error);
            },
            () => console.log("poll complete")
        );

        _sub = mainSub.add(pollSub);
        
        return _sub;
    }

    function unsubscribe() {
        console.log("unsubscribe");
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
