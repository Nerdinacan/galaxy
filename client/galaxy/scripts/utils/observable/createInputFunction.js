/**
 * Creates a function that updates an internal observable subject for manual
 * manipulation of stream contents. Access to the internal observable is
 * through the .$ property of the resulting function.
 */

import { Subject } from "rxjs";

export function createInputFunction() {
    const buffer = new Subject();
    const updateFn = buffer.next.bind(buffer);
    updateFn.$ = buffer;
    return updateFn;
}
