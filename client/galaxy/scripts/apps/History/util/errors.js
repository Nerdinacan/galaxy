/**
 * Observable that can be subscribed to by other systems to react to various
 * kinds of messages within the app.
 */

import { Subject } from "rxjs";

// error type constants, can be used by listeners
// to distinguish between various message types
export const errorTypes = {
    AUTH: "AUTH"
};

// error subject, do not expose subject dirctly
const _err = new Subject();
export const errors = () => {
    return _err.asObservable();
};

/**
 * Subject records ajax errors during attempted ajax calls
 */
export function setError(type, error) {
    _err.next({ type, error });
    return errors;
}
