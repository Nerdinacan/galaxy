import { defer, concat } from "rxjs";
import { tap, concatMap, delay, repeatWhen, takeUntil } from "rxjs/operators";
import { createInputFunction } from "./utils";
import { CheckHistory$ } from "./CheckHistory$";
import { ContentUpdate$ } from "./ContentUpdate$";


export const stopPolling = createInputFunction();

export function PollUpdate$(existingHistory$, param$) {

    let counter = 0;
    const pollDelay = 5000;

    const update$ = defer(() => {
        const freshHistory$ = CheckHistory$(existingHistory$);
        const contentUpdate$ = ContentUpdate$(param$, counter++);
        return concat(contentUpdate$, freshHistory$);
    });

    const stop$ = stopPolling.$.pipe(
        tap(() => console.log("stop polling"))
    );

    const poll$ = update$.pipe(
        repeatWhen(done => done.pipe(
            takeUntil(stop$),
            delay(pollDelay)
        ))
    );

    return param$.pipe(
        tap(() => counter = 0),
        concatMap(() => poll$)
    );
}
