
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


// Scrub history content

const conformManifest = conformToSchema(historyContentSchema);

export function prepareManifestItem(raw) {
    const item = conformManifest(raw);
    item.isDeleted = raw.deleted;
    return item;
}


// Prep Dataset for insert

const conformDataset = conformToSchema(datasetSchema);

export function prepareDataset(raw) {
    const ds = conformDataset(raw);
    ds.isDeleted = raw.deleted;
    return ds;
}


// Prep Dataset Collection

const conformDsc = conformToSchema(datasetCollectionSchema);

export function prepareDatasetCollection(raw) {
    const dsc = conformDsc(raw);
    if (!dsc.update_time) {
        dsc.update_time = (new Date()).toISOString();
    }
    return dsc;
}

