import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
import { defer } from "rxjs";
import { shareReplay, mergeMap, catchError } from "rxjs/operators";
import { dbConfig, historySchema, historyContentSchema, 
    datasetSchema, datasetCollectionSchema } from "./schema";


RxDB.plugin(idb);


export const db$ = defer(getDB).pipe(
    catchError(err => wipeDB()),
    shareReplay(1)
);

export const history$ = initCollection({
    name: "history",
    schema: historySchema
});

export const historyContent$ = initCollection({
    name: "historycontent",
    schema: historyContentSchema
});

export const dataset$ = initCollection({
    name: "dataset",
    schema: datasetSchema
});

export const datasetCollection$ = initCollection({
    name: "datasetcollection",
    schema: datasetCollectionSchema
});


// Helper funcs

export async function getDB(extraConfigs = {}) {
    const cfg = Object.assign({}, dbConfig, extraConfigs);
    return await RxDB.create(cfg);
}

export function wipeDB() {
    return db$.pipe(
        mergeMap(db => db.destroy()),
        mergeMap(() => getDB())
    );
}

export async function buildCollection(db, config) {
    return await db.collection(config)
}

export async function rebuildCollection(db, config) {
    await db.removeCollection(config.name);
    return await buildCollection(db, config);
}

export function initCollection(config) {
    return db$.pipe(
        mergeMap(db => buildCollection(db, config)),
        catchError(err => {
            console.log("Init collection error", err);
            return db$.pipe(
                mergeMap(db => rebuildCollection(db, config))
            );
        }),
        shareReplay(1)
    );
}
