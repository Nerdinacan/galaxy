import { defer, interval, combineLatest, timer } from "rxjs";
import { switchMap, startWith, takeUntil, tap } from "rxjs/operators";
import { doUpdates } from "./doUpdates";


// Clock fires immediately when instantiated then once
// every 4 seconds until we assume there's been timeout

const pollDelay = 4000; // 4s
const timeoutDelay = 10 * 60 * 1000; // 10 mins

const clock$ = defer(() => {
    const idleTimeout = timer(timeoutDelay);
    return interval(pollDelay).pipe(
        startWith(-1),
        takeUntil(idleTimeout)
    );
});


// when the request parameters change, restart the clock because
// the first emission will require a different query than subsequent
// update queries

export function PollUpdate$(history$, param$) {
    return combineLatest(history$, param$).pipe(
        switchMap(([ history, params ]) => {
            return clock$.pipe(
                tap(counter => doUpdates(counter, history, params))
            );
        })
    );
}
