// Build a custom observable to monitor the user quota
// https://backbonejs.org/#Events-listenTo
// See Galaxy.quotaMeter
// emmitting model is Galaxy.user
import { getGalaxyInstance } from "app";
import { of, fromEventPattern } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { retryWhen, first, delay, take  } from "rxjs/operators";

// Wait until we have a user
const user$ = of(getGalaxyInstance().user).pipe(
    retryWhen(errors => errors.pipe(delay(100),take(20))),
    first()
);

export const Quota$ = user$.pipe(
    mergeMap(user => {
        const EVTS = "change:quota_percent change:total_disk_usage";
        const listen = handler => user.on(EVTS, handler);
        const stopListen = handler => user.off(EVTS, handler);
        return fromEventPattern(listen, stopListen);
    })
)
