import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
import { of } from "rxjs";
import { tap, shareReplay, mergeMap, switchMapTo, retryWhen, take, delay } from "rxjs/operators";
import { dbConfig, historySchema, historyContentSchema, datasetSchema, datasetCollectionSchema, paramDateSchema } from "./schema";
import moment from "moment";


RxDB.plugin(idb);


/**
 * RxDB database object observable, tries 2 times to create then fails.
 */

const dbConfig$ = of(dbConfig);

export const db$ = dbConfig$.pipe(
    mergeMap(config => {
        console.log(`Building database ${config.name}`);
        return RxDB.create(config).catch(err => {
            console.warn("Error creating db", err);
            return err;
        });
    }),
    retryWhen(err => err.pipe(
        tap(err => console.warn("DB build error", err)),
        take(2),
        switchMapTo(dbConfig$),
        mergeMap(config => {
            const { name, adapter } = config;
            console.log(`Wiping database ${name}`);
            return RxDB.removeDatabase(name, adapter).catch(err => {
                console.warn("Error wiping database db", err);
                return err;
            });
        }),
        delay(200)
    )),
    shareReplay(1)
)


/**
 * Creates an observable RxDB collection object. Tries 2 times
 * to create, drops collection each time in event of failure
 */

export function initCollection(config) {
    
    const { name } = config;

    return db$.pipe(
        mergeMap(db => db.collection(config).catch(err => {
            console.warn("Error creating collection", err);
            return err;
        })),
        retryWhen(err => err.pipe(
            tap(err => console.warn(`Collection build error`, name, err)),
            take(2),
            switchMapTo(db$),
            mergeMap(db => {
                console.warn(`Removing collection ${name}`);
                return db.removeCollection(name).catch(err => {
                    console.warn("Error deleting collection", err);
                    return err;
                });
            }),
            delay(100)
        )),
        shareReplay(1)
    );
}



// common date utilities

const methods = {
    getUpdateDate() {
        return moment.utc(this.update_time);
    }
}


// Specific collections

export const history$ = initCollection({
    name: "history",
    schema: historySchema,
    methods
})

export const historyContent$ = initCollection({
    name: "historycontent",
    schema: historyContentSchema,
    methods: {
        ...methods,

        title() {
            const { name, isDeleted, visible, purged } = this;

            let result = name;

            const itemStates = [];
            if (isDeleted) {
                itemStates.push("Deleted");
            }
            if (visible == false) {
                itemStates.push("Hidden");
            }
            if (purged) {
                itemStates.push("Purged");
            }
            if (itemStates.length) {
                result += ` (${itemStates.join(", ")})`;
            }

            return result;
        },

    }
})

export const dataset$ = initCollection({
    name: "dataset",
    schema: datasetSchema,
    methods: {

        ...methods,

        getUrl(urlType) {
            const { id, file_ext } = this;
            const urls = {
                purge: `datasets/${id}/purge_async`,
                display: `datasets/${id}/display/?preview=True`,
                edit: `datasets/edit?dataset_id=${id}`,
                download: `datasets/${id}/display?to_ext=${file_ext}`,
                report_error: `dataset/errors?id=${id}`,
                rerun: `tool_runner/rerun?id=${id}`,
                show_params: `datasets/${id}/show_params`,
                visualization: "visualization",
                meta_download: `dataset/get_metadata_file?hda_id=${id}&metadata_name=`
            };
            return (urlType in urls) ? urls[urlType] : null;
        },

        isDeletedOrPurged() {
            return this.isDeleted || this.purged;
        },

        hasData() {
            return this.file_size > 0;
        },

        hasMetaData() {
            return this.meta_files.length > 0;
        }
    }
})

export const datasetCollection$ = initCollection({
    name: "datasetcollection",
    schema: datasetCollectionSchema,
    methods
})

export const paramDateCollection$ = initCollection({
    name: "paramdatecollection",
    schema: paramDateSchema
})