import { isObservable, of, from, combineLatest } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { conformToSchema, datasetSchema } from "../schema";
import { dataset$ } from "../db";


export function Dataset$(ds) {

    let ds$ = isObservable(ds) ? ds : of(ds);

    return ds$.pipe(
        map(processRawDataset),
        mergeMap(item => combineLatest(dataset$, of(item))),
        mergeMap(inputs => from(cacheContentItem(inputs)))
    );
}

const conformDataset = conformToSchema(datasetSchema);

export function processRawDataset(raw) {
    let o = conformDataset(raw);
    o.update_time = Date.parse(raw.update_time);
    return o;
}

async function cacheContentItem([ collection, item ]) {
    return await collection.atomicUpsert(item);
}
