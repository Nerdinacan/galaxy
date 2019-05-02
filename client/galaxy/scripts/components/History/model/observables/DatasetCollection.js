import { isObservable, of } from "rxjs";

export function DatasetCollection$(dsc) {
    let dsc$ = isObservable(dsc) ? dsc : of(dsc);
    return dsc$;
}