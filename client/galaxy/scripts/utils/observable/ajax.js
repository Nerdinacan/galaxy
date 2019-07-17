/**
 * Ajax observables customized to galaxy. Prepand configuration api paths,
 * apply general error handling and retries, etc.
 */

import { map, mergeMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { prependPath } from "utils/redirect";

export const ajaxGet = () => url$ => {
    return url$.pipe(
        map(prependPath),
        mergeMap(url => ajax.getJSON(url))
    );
};
