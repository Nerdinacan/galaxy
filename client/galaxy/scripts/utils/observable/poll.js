import { pipe, merge, defer } from "rxjs";
import { switchMap, repeatWhen, debounceTime } from "rxjs/operators";

/**
 * Operator to create a periodic poll. Individual requests are built with the
 * buildRequest parameter which should return an observable. Optional retrigger events force a poll immediately
 * delaytime is the amount of time to wait after the previous poll has completed
 */
export const poll = ({
    buildRequest,
    delayTime = 5000,
    reTriggers = []
}) => {

    if (!Array.isArray(reTriggers)) {
        reTriggers = [reTriggers].filter(Boolean);
    }

    if (!buildRequest) {
        throw new Error("Please provide a function to generate a poll observable from your source inputs");
    }

    return pipe(
        switchMap(inputs => {

            // build request from source inputs
            const request$ = defer(() => buildRequest(inputs));

            // repeat that request on the timer or when immediate triggers fire
            return request$.pipe(
                repeatWhen(done => {
                    const goAgain$ = merge(done, ...reTriggers);
                    return goAgain$.pipe(debounceTime(delayTime));
                })
            )
        })
    )
}

