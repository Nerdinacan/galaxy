import { merge } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import {
    history$ as historyColl$, 
    historyContent$,
    dataset$, 
    datasetCollection$    
} from "../db";

import { prepareManifestItem } from "../schema/prepare";
import { safeAssign } from "utils/safeAssign";

// General caching lookup by pkey
// live = true => function that returns an observable
// live = false => function that returns a promise

export const CachedItem = (coll$, keyField = "id", live = true) => key => {
    return coll$.pipe(
        map(coll => coll.findOne().where(keyField).eq(key)),
        mergeMap(query => live ? query.$ : query.exec()),
        map(doc => doc ? doc.toJSON() : null)
    );
}


// Root history object
export const History$ = CachedItem(historyColl$);

// individual contents by type_id, summary version
export const HistoryContent$ = CachedItem(historyContent$, "type_id");

// Dataset by id
export const Dataset$ = CachedItem(dataset$);

// Dataset Collection by id
export const DatasetCollection$ = CachedItem(datasetCollection$);



// Delete stuff from dataset and historycontent

export function flushCachedDataset(ds) {

    const wipeDs = dataset$.pipe(
        mergeMap(coll => coll.findOne(ds.id).remove())
    );

    const wipeContent = historyContent$.pipe(
        mergeMap(coll => coll.findOne(ds.type_id).remove())
    );
    
    const killMe = merge(wipeDs, wipeContent);

    killMe.subscribe(
        null,
        // result => console.log("flushCachedDataset result", result), 
        err => console.warn("flushCachedDataset error", err), 
        () => console.log("flushCachedDataset complete")
    );
}


export async function cacheContentItem(item) {
    
    const props = prepareManifestItem(item);
    delete props.type_id;
    delete props._rev;
    props.update_time = (new Date(0)).toISOString();

    const coll = await historyContent$.toPromise();
    const existing = await coll.findOne(item.type_id).exec();
    if (!existing) {
        const newDoc = await coll.newDocument(props).save();
        console.log("newDoc", newDoc);
        return newDoc;
    }
    
    const updated = await existing.atomicUpdate(doc => safeAssign(doc, props));
    console.log("updated", updated);
    return updated;
}
