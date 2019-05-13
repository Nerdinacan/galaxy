import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
import { throwError, defer, from } from "rxjs";
import { shareReplay, mergeMap, catchError, retry } from "rxjs/operators";

import {
    dbConfig,
    historyContentSchema, 
    datasetSchema, 
    datasetCollectionSchema,
} from "./schema";

RxDB.plugin(idb);

let _db = null;

export async function getDB() {
    if (_db === null) {
        _db = await RxDB.create(dbConfig);
    }
    return _db;
}

export async function killDB() {
    const result = await RxDB.removeDatabase(dbConfig.name, dbConfig.adapater);
    _db = null;
    return result;
}

export const db$ = defer(getDB);

function buildCollection(config) {
    return db$.pipe(
        mergeMap(db => db.collection(config)),
        catchError((err, caught) => {
            if (err.code == "DB6") {
                return from(killDB()).pipe(
                    mergeMap(getDB),
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
