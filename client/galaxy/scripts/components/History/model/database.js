import { Subject, from, defer } from "rxjs/index";
import { map, share } from "rxjs/operators";

import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";

RxDB.plugin(idb);

// init database on subscription
export const db = from(defer(() => {
    return RxDB.create({
        name: "testo",
        adapter: "idb"
    });
})).pipe(share());

export const historyCollection = db.pipe(map(db => {
    return db.collection({
        name: 'historystuff'
    });
})).pipe(share());

const saveHistorySubject = new Subject();

export async function stashHistory(history) {
    saveHistorySubject.next(history);
}

