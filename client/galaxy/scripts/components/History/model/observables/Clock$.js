// Clock fires immediately when instantiated then once
// every 4 seconds until we assume there's been timeout

import { defer, interval, timer, Subject } from "rxjs";
import { startWith, takeUntil } from "rxjs/operators";

const halt$ = new Subject();
export const stopPolling = () => halt$.next(true);

export const Clock$ = (pollInterval, timeoutInterval) => defer(() => {
    const idleTimeout = timer(timeoutInterval);
    return interval(pollInterval).pipe(
        startWith(-1),
        takeUntil(idleTimeout),
        takeUntil(halt$)
    );
});
