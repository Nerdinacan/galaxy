/**
 * Functions that prepare a raw object for insertion into the collection of the
 * indicated schema. I tried implementing this with collection hooks, but had
 * erratic results.
 */

import historySchema from "./schema/history.schema";
import historyContentSchema from "./schema/historyContent.schema";
import datasetSchema from "./schema/dataset.schema";
import datasetCollectionSchema from "./schema/datasetCollection.schema";
import conformToSchema from "./conformToSchema";



// History

const conformHistory = conformToSchema(historySchema);

export function prepareHistory(raw) {
    const item = conformHistory(raw);
    item.isDeleted = raw.deleted;
    return item;
}


// History content

const conformManifest = conformToSchema(historyContentSchema);

export function prepareContentSummary(raw) {

    const item = conformManifest(raw);

    item.isDeleted = raw.deleted;

    // stupid api does not return purged for collections
    if (raw.purged === undefined) {
        item.purged = false;
    }

    // Again, stupid api will mark something as purged
    // but not deleted.
    if (raw.purged == true) {
        item.isDeleted = true;
    }

    // stupid api does not return update_time for collections
    if (!raw.update_time) {
        item.update_time = (new Date()).toISOString();
    }

    return item;
}


// Dataset

const conformDataset = conformToSchema(datasetSchema);

export function prepareDataset(raw) {
    const ds = conformDataset(raw);

    ds.isDeleted = raw.deleted;

    if (raw.purged) {
        ds.isDeleted = true;
    }

    return ds;
}


// Dataset Collection

const conformDsc = conformToSchema(datasetCollectionSchema);

export function prepareDatasetCollection(raw) {
    const dsc = conformDsc(raw);

    dsc.isDeleted = raw.deleted;

    if (raw.purged === undefined) {
        dsc.purged = false;
    }

    if (!raw.update_time) {
        dsc.update_time = (new Date()).toISOString();
    }

    return dsc;
}

