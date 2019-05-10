import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
// import hooks from "rxdb-utils/hooks";
// import timestamps from 'rxdb-utils/timestamps';
import { from } from "rxjs";
import { mergeMap, shareReplay } from "rxjs/operators";
// import { log } from "./utils";

import {
    dbConfig,
    historyContentSchema, 
    datasetSchema, 
    datasetCollectionSchema,
} from "./schema";

RxDB.plugin(idb);
// RxDB.plugin(hooks);
// RxDB.plugin(timestamps);

const db$ = from(RxDB.create(dbConfig)).pipe(
    shareReplay(1)
);

function buildCollection(config) {
    return db$.pipe(
        mergeMap(db => from(db.collection(config))),
        shareReplay(1)
    );
}

export const historyContent$ = buildCollection({
    name: "historycontent",
    schema: historyContentSchema
});

export const dataset$ = buildCollection({
    name: "dataset",
    schema: datasetSchema
});

export const datasetCollection$ = buildCollection({
    name: "datasetcollection",
    schema: datasetCollectionSchema
});
