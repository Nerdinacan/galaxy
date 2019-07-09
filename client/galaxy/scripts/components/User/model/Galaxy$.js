import { concat, defer, of, throwError } from "rxjs";
import { retryWhen, take, delay } from "rxjs/operators";
import { getGalaxyInstance } from "app";

// retry params
const loadInterval = 100, loadRetries = 10;

// look at horrible global variables to get galaxy
const checkSingleton = () => {
    const galaxy = getGalaxyInstance();
    if (!galaxy) throw "Missing galaxy variable";
    return of(galaxy);
}

export const Galaxy$ = defer(checkSingleton).pipe(
    retryWhen(errors => {
        const retries = errors.pipe(
            delay(loadInterval),
            take(loadRetries)
        );
        const errorOut = throwError(new Error('Retry limit exceeded!'));
        return concat(retries, errorOut);
    })
);
