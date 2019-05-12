import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
// import hooks from "rxdb-utils/hooks";
// import timestamps from 'rxdb-utils/timestamps';
import { defer } from "rxjs/index";
import { shareReplay, mergeMap } from "rxjs/operators";

import {
    dbConfig,
    historyContentSchema, 
    datasetSchema, 
    datasetCollectionSchema,
} from "./schema";

RxDB.plugin(idb);
// RxDB.plugin(hooks);
// RxDB.plugin(timestamps);

export const db$ = defer(buildDB).pipe(
    shareReplay(1)
);

async function buildDB() {
    // console.log("building DB");
    return await RxDB.create(dbConfig);
}

function buildCollection(config) {
    return db$.pipe(
        mergeMap(db => {
            // console.log(`building collection: ${config.name}`);
            return db.collection(config);
        }),
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
