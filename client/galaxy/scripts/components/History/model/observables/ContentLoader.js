import { isObservable, of } from "rxjs";
import { PollUpdate$ } from "./PollUpdate$";
import { Param$ } from "./Param$";
import { Content$ } from "./Content$";
import store from "store";

export function ContentLoader(history) {

    const history$ = isObservable(history) ? history : of(history);
    const param$ = Param$(store, history$);

    // subscribe to content observable
    function subscribe(/* success, error, complete */) {
        const content$ = Content$(history$, param$);
        const sub = content$.subscribe.apply(content$, arguments);
        return sub.add(subscribeToPolling());
    }

    // piggy-back subscription to polling
    function subscribeToPolling() {
        const update$ = PollUpdate$(history$, param$);
        return update$.subscribe(
            result => console.log("poll result", result),
            error => console.warn("poll error", error),
            () => console.log("poll complete")
        );
    }

    return {
        subscribe
    };
}
