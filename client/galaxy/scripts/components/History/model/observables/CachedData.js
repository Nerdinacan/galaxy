import { filter, map, mergeMap } from "rxjs/operators";
import { dataset$, datasetCollection$, historyContent$ } from "../db";

const CachedItem = (coll, pKey = "id") => item => {
    return coll.pipe(
        mergeMap(coll => coll.findOne().where(pKey).eq(item[pKey]).$),
        filter(Boolean),
        map(doc => doc.toJSON())
    );
}

export const Dataset$ = CachedItem(dataset$);
export const DatasetCollection$ = CachedItem(datasetCollection$);
export const HistoryContent$ = CachedItem(historyContent$, "type_id");