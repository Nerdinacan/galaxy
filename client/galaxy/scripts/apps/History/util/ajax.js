import { of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { withLatestFrom, map, switchMap, pluck, catchError } from "rxjs/operators";
import { errorTypes, setError } from "./errors";
import config from "./config";

/**
 * Creates an observable ajax handler, handles appending generic configuration
 * properties and error/retry handling logic for every ajax api call
 *
 * @param {object} request
 */
export const doMeSomeAjax = request => {
    return of(request).pipe(
        withLatestFrom(config),
        map(prependUrl),
        switchMap(ajax),
        pluck("response"),
        catchError(ajaxErrorHandler)
    );
};

/**
 * Pushes new error onto global error observable when we run into
 * an authentication problem during an ajax call. See ajaxErrorMonitor
 * for an example of how to respond to recorded errors.
 *
 * @param {Error} err error thrown in doMeSomeAjax
 * @param {Observable} caught original observable
 */
const ajaxErrorHandler = (err, caught) => {
    switch (err.status) {
        case 401: // unauthorized
        case 403: // forbidden
            setError(errorTypes.AUTH, err);
            break;
    }
    throw err;
};

/**
 * Assembles ajax request payload using configuration information and
 * the user-requested fields, url, headers, etc. Ultimately the product
 * of this function will be fed to the ajax rxjs function.
 *
 * @param {Array} [request, config]
 */
const prependUrl = ([request, config]) => {
    let { url, ...requestParams } = request;
    let newUrl = `${config.apiPrefix}/${url}`.replace(/\/\//g, "/");
    return { ...requestParams, url: newUrl };
};
