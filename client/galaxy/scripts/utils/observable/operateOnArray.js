import { of, pipe, forkJoin } from "rxjs";
import { map, mergeMap } from "rxjs/operators";

// cache an array of raw content objects return result
export const operateOnArray = operation => pipe(
    map(list => list.map(item => of(item).pipe(operation))),
    mergeMap(obs => forkJoin(obs))
)
