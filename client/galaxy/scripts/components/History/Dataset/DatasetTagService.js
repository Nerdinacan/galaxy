import { TagService } from "components/Tags/tagService";
import { createTag } from "components/Tags/model";
import store from "store";

// TODO: refactor Tags. Not liking this service injection

export class DatasetTagService extends TagService {

    constructor(dataset, history_id) {
        super({
            id: dataset.id,
            itemClass: "HistoryDatasetAssociation",
            context: "dataset-item-component"
        });
        this.dataset = dataset;
        this.history_id = history_id;
    }

    async save(rawTag) {
        const tag = createTag(rawTag);
        const tagSet = new Set(this.dataset.tags);
        tagSet.add(tag.text);
        const cachedDataset = await this.saveDatasetTags(tagSet);
        return tag;
    }

    async delete(rawTag) {
        const tag = createTag(rawTag);
        const tagSet = new Set(this.dataset.tags);
        tagSet.delete(tag.text);
        const cachedDataset = await this.saveDatasetTags(tagSet);
        return tag;
    }

    async saveDatasetTags(rawTags) {
        return await store.dispatch("dataset/updateDatasetFields", {
            history_id: this.history_id,
            dataset_id: this.dataset.id,
            fields: { 
                tags: Array.from(rawTags)
            }
        });
    }

}
