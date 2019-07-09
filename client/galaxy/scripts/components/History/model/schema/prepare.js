/**
 * Functions that prepare a raw object for insertion into the collection of the
 * indicated schema. I tried implementing this with collection hooks, but had
 * erratic results.
 */
import historySchema from "./history.schema";
import historyContentSchema from "./historyContent.schema";
import datasetSchema from "./dataset.schema";
import datasetCollectionSchema from "./datasetCollection.schema";
import { conformToSchema } from "./schemaUtils";



// History

const conformHistory = conformToSchema(historySchema);

export function prepareHistory(raw) {
    const item = conformHistory(raw);
    item.isDeleted = raw.deleted;
    return item;
}


// History content

const conformManifest = conformToSchema(historyContentSchema);

export function prepareManifestItem(raw) {
    const item = conformManifest(raw);
    item.isDeleted = raw.deleted;
    return item;
}


// Dataset

const conformDataset = conformToSchema(datasetSchema);

export function prepareDataset(raw) {
    const ds = conformDataset(raw);
    ds.isDeleted = raw.deleted;
    return ds;
}


// Dataset Collection

const conformDsc = conformToSchema(datasetCollectionSchema);

export function prepareDatasetCollection(raw) {
    const dsc = conformDsc(raw);
    if (!dsc.update_time) {
        dsc.update_time = (new Date()).toISOString();
    }
    return dsc;
}

