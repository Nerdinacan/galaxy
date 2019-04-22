import { defer, from } from "rxjs/index";
import { map, share, flatMap, tap, mergeMap } from "rxjs/operators";

import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";

RxDB.plugin(idb);


const dbProps = {
    name: "testo",
    adapter: "idb"
}

const historyProps = {
    name: 'historystuff',
    schema: {
        title: "history stuff",
        version: 0,
        description: "history object",
        type: "object",
        properties: {
            id: { type: "string", primary: true },
            name: { type: "string" },
            update_time: { type: "string" }
        }
    }
}

// init database on subscription
export const db = defer(() => {
    return RxDB.create(dbProps);
});

export const historyCollection = db.pipe(
    mergeMap(db => {
        return db.collection(historyProps);
    }),
    tap(thing => console.log("hc?", thing)),
    share()
)

