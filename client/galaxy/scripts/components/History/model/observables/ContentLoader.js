import { isObservable, Subject, of, combineLatest } from "rxjs";
import { tap, debounceTime, distinctUntilChanged, share, switchMap } from "rxjs/operators";
import { historyContent$ } from "../db";
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
        distinctUntilChanged(),
        share()
    );

    // generates an observable that looks at the local database
    // and updates when the database does, query updates when params change
    const content$ = combineLatest(history$, param$, historyContent$).pipe(
        switchMap(buildContentObservable)
    );

    // polling updates
    const update$ = PollUpdate$(history$, param$);


    // Subscribe to both content query and update processor
    let _sub;

    function subscribe() {
        const mainSub = content$.subscribe.apply(content$, arguments);
        const pollSub = update$.subscribe(
            null,
            error => console.warn("ContentLoader polling error", error),
            () => console.log("ContentLoader poll complete")
        );
        _sub = mainSub.add(pollSub);
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


// Return an observable that emits content of the query
// TODO: apply params object to the query characteristics
function buildContentObservable([ history, params, coll ]) {

    const selector = {};
    selector.history_id = { $eq: history.id };

    if (!params.showDeleted) {
        selector.isDeleted = { $eq: false };
    }

    if (!params.showHidden) {
        selector.visible = { $eq: true };
    }

    if (params.filterText.length) {
        const filterRE = new RegExp(params.filterText, "gi");
        selector.name = { $regex: filterRE };
    }

    const query = coll.find(selector)
        .skip(params.offset)
        .limit(params.pageSize)
        .sort("-hid");

    return query.$;
}
