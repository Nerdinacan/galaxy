import { defer, concat } from "rxjs";
import { tap, concatMap, delay, repeatWhen, takeUntil } from "rxjs/operators";
import { createInputFunction } from "./utils";
import { CheckHistory$ } from "./CheckHistory$";
import { ContentUpdate$ } from "./ContentUpdate$";


export const stopPolling = createInputFunction();

export function PollUpdate$(existingHistory$, param$) {

    let counter = 0;

    const update$ = defer(() => {
        const contentUpdate$ = ContentUpdate$(param$, counter++);
        const freshHistory$ = CheckHistory$(existingHistory$);
        return concat(contentUpdate$, freshHistory$);
    });

    const poll$ = update$.pipe(
        takeUntil(stopPolling.$),
        repeatWhen(done => done.pipe(delay(2000)))
    )

    return param$.pipe(
        tap(() => counter = 0),
        concatMap(() => poll$)
    );
}
