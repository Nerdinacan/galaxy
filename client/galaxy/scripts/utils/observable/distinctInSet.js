/**
 * Distinct, but with an externally-provided previous result set which allows us
 * to decide the scope of the distinction
 */
import { pipe } from "rxjs";
import { filter, tap } from "rxjs/operators";

export const distinctInSet = (previous = new Set()) => pipe(
    filter(val => !previous.has(val)),
    tap(val => previous.add(val))
)
