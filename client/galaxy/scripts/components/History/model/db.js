import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
import { throwError, defer, from } from "rxjs/index";
import { shareReplay, mergeMap, catchError, retry } from "rxjs/operators";

import {
    dbConfig,
    historyContentSchema, 
    datasetSchema, 
    datasetCollectionSchema,
} from "./schema";

RxDB.plugin(idb);

export const db$ = defer(buildDB).pipe(
    shareReplay(1)
);

async function buildDB() {
    return await RxDB.create(dbConfig);
}

async function killDB() {
    return await RxDB.removeDatabase(dbConfig.name, dbConfig.adapater);
}

function buildCollection(config) {
    return db$.pipe(
        mergeMap(db => db.collection(config)),
        catchError((err, caught) => {
            if (err.code == "DB6") {
                return from(killDB()).pipe(
                    mergeMap(buildDB),
                    mergeMap(buildCollection(config)),
                    mergeMap(() => throwError(err))
                );
            }
            return caught;
        }),
        retry(1),
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
