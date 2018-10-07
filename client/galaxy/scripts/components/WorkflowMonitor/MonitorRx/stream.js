/**
 * When you subscribe to this thing, it emits messages every X seconds until the
 * status indicates the invocation is done, then the stream completes
 */

import { interval } from "rxjs";
import { switchMap, map, mapTo, takeWhile } from "rxjs/operators";
import { hydrate, getInvocationsForWorkflow, invocationCache, loadInvocations } from "../services";

/**
 * Returns an observable that delivers the invocation status for the indicated
 * workflow on a timer until a specific status is achieved, then stops.
 *
 * @param {object} params { workflow_id, invocation_id }
 * @returns {observable} Observable that polls for status updates until the
 * indicated workflow is completed
 */
export function getStatusStream(params) {

    return interval(300).pipe(
        mapTo(params),
        switchMap(loadInvocations(invocationCache, getInvocationsForWorkflow)),
        map(hydrate),
        takeWhile(invocation => {
            return !invocation.isComplete();
        })
    );
}
