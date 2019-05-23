// Clock fires immediately when instantiated then once
// every 4 seconds until we assume there's been timeout

import { defer, interval, timer } from "rxjs";
import { startWith, takeUntil } from "rxjs/operators";


export const Clock$ = (pollInterval, timeoutInterval) => defer(() => {
    const idleTimeout = timer(timeoutInterval);
    return interval(pollInterval).pipe(
        startWith(-1),
        takeUntil(idleTimeout)
    );
});
