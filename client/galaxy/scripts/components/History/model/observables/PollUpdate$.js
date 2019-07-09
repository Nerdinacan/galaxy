import { combineLatest, defer, of } from "rxjs";
import { tap, concatMap, share, take, delay, repeatWhen } from "rxjs/operators";
// import { createInputFunction } from "./utils";
import { CheckHistory$ } from "./CheckHistory$";
import { Manifest$ } from "./Manifest$";
import { ContentUpdate$ } from "./ContentUpdate$";


let doPolling = true;
export const stopPolling = () => doPolling = !doPolling;

export function PollUpdate$(history$, param$) {
    
    // every time we subscribe to this, we send a poll
    const request$ = defer(() => {
        return combineLatest(history$, param$).pipe(
            take(1),
            concatMap(doUpdates)
        );
    });

    // repeat when complete (after delay) or when params change (immediately)
    return request$.pipe(
        repeatWhen(done => {
            // TODO: get repeat to restart when inputs change
            const next$ = done.pipe(delay(3000));
            // const trigger$ = merge(next$, param$);
            // return trigger$.pipe(throttleTime(1000));
            return next$;
        })
    );
}


/**
 * Check server for fresh history (CheckHistory$)
 * Retrieve list of content for that history (Manifest$)
 * Retrieve required individual detailed updates (ContentUpdate$)
 */
export function doUpdates([ history, params ]) {
    const activeHistory$ = CheckHistory$(of(history)).pipe(share());
    const manifest$ = Manifest$(activeHistory$, of(params));
    return ContentUpdate$(manifest$, activeHistory$);
}
