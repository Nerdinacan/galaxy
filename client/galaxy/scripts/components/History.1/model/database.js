import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
import { defer } from "rxjs/index";
import { map, shareReplay, mergeMap } from "rxjs/operators";

import {
    dbConfig,
    historySchema, 
    historyContentSchema, 
    datasetSchema, 
    datasetCollectionSchema 
} from "./schema";

RxDB.plugin(idb);



// DB Root

const db = defer(() => RxDB.create(dbConfig))
    .pipe(shareReplay(1));


// Collection build utility

function buildCollection(config, setupFn = null) {
    return db.pipe(
        mergeMap(db => db.collection(config)),
        map(c => setupFn ? setupFn(c) : c),
        shareReplay(1)
    )
}


export const histories = buildCollection({
    name: "history", 
    schema: historySchema
});

export const historyContent = buildCollection({
    name: "historycontent",
    schema: historyContentSchema
});

export const datasets = buildCollection({
    name: "dataset",
    schema: datasetSchema
});

export const datasetCollections = buildCollection({
    name: "datasetcollection",
    schema: datasetCollectionSchema
});
