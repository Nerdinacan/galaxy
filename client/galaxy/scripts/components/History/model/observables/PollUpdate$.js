import { combineLatest, defer, of } from "rxjs";
import { tap, concatMap, share, delay, repeatWhen, take, takeUntil, finalize } from "rxjs/operators";
import { createInputFunction } from "./utils";
import { CheckHistory$ } from "./CheckHistory$";
import { Manifest$ } from "./Manifest$";
import { ContentUpdate$ } from "./ContentUpdate$";


export const stopPolling = createInputFunction();

export function PollUpdate$(history$, param$) {

    // every time we subscribe to this, we send a poll
    const request$ = defer(() => combineLatest(history$, param$).pipe(
        take(1),
        tap(inputs => console.log("Starting poll....", inputs)),
        concatMap(doUpdates)
    ));

    // repeat when complete (after delay) or when params change (immediately)
    return request$.pipe(
        repeatWhen(done => {
            return done.pipe(
                delay(5000),
                takeUntil(stopPolling.$),
                take(2)
            );
        })
    );
}


/**
 * Check server for fresh history (CheckHistory$)
 * Retrieve list of content for that history (Manifest$)
 * Retrieve required individual detailed updates (ContentUpdate$)
 */
export function doUpdates([ history, params ]) {
    const existingHistory$ = of(history);
    const freshHistory$ = CheckHistory$(existingHistory$);
    const manifest$ = Manifest$(existingHistory$, of(params));
    return ContentUpdate$(manifest$, freshHistory$);
}
