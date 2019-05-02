import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
// import hooks from "rxdb-utils/hooks";
// import timestamps from 'rxdb-utils/timestamps';
import { from } from "rxjs";
import { shareReplay } from "rxjs/operators";
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


export const db$ = from(buildDb()).pipe(
    shareReplay(1)
);

async function buildDb() {

    let db = await RxDB.create(dbConfig);

    let historyContent = await db.collection({
        name: "historycontent",
        schema: historyContentSchema
    });

    let dataset = await db.collection({
        name: "dataset",
        schema: datasetSchema
    });

    let datasetCollection = await db.collection({
        name: "datasetcollection",
        schema: datasetCollectionSchema
    });

    return {
        historyContent,
        dataset,
        datasetCollection
    }
}
