import { defer, merge } from "rxjs";
import { tap, delay, repeatWhen, takeUntil } from "rxjs/operators";
import { createInputFunction } from "./utils";
import { CheckHistory$ } from "./CheckHistory$";
import { ContentUpdate$ } from "./ContentUpdate$";


export const stopPolling = createInputFunction();

export function PollUpdate$(existingHistory$, param$) {

    const request$ = defer(() => {
        const freshHistory$ = CheckHistory$(existingHistory$);
        return ContentUpdate$(freshHistory$, param$);
    });

    // repeat when complete (after delay) or when params change (immediately)
    return request$.pipe(
        repeatWhen(done => {
            return done.pipe(
                delay(4000),
                takeUntil(stopPolling.$)
            );
        })
    );
}
