import { from, combineLatest, of } from "rxjs";
import { tap, mergeMap } from "rxjs/operators";

export const log = label => source => {
    return source.pipe(
        tap(o => console.log(label, o))
    )
}

export const warn = label => source => {
    return source.pipe(
        tap(o => console.warn(label, o))
    )
}

// split observable array result into individual items and
// emit as individuals
export const split = () => source => {
    return source.pipe(
        mergeMap(from)
    );
}

// "withLatestFrom" not behaving as expected
// with rxdb observables, but this works
export const withLatestFromDb = dbo$ => source$ => {
    return source$.pipe(
        mergeMap(o => combineLatest(of(o), dbo$)),
    );
}
