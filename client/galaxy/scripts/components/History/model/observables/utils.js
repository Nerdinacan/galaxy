import { from, combineLatest, of } from "rxjs/index";
import { tap, mergeMap } from "rxjs/operators";

export const log = label => source => {
    return source.pipe(
        tap(o => console.log(label, o))
    )
}

// split array result into individual items
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
