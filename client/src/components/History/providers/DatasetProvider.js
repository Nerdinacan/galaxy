/**
 * A provider for a single dataset, checks the cache, then does a query on expand that retrieves a
 * newer version if one exists
 */

import { getContentByTypeId, cacheContent } from "../caching";
import { getContentDetails } from "../model/queries";
import { Dataset } from "../model";

// require a history_id and a type_id
export const datasetContentValidator = (val, debug = false) => {
    const { history_id, type_id, id, history_content_type } = val;
    const valid = history_id && type_id && id && history_content_type == "dataset";
    if (debug && !valid) {
        console.warn("Please provide and item with a history_id and a type_id to DatasetProvider");
    }
    return valid;
};

export default {
    props: {
        item: {
            type: Object,
            required: true,
            validator: (val) => datasetContentValidator(val, true),
        },
    },

    data() {
        return {
            rawData: null,
        };
    },

    computed: {
        dataset() {
            const props = this.rawData || this.item;
            return props ? new Dataset(props) : null;
        },
        loaded() {
            return this.dataset?.isFullDataset || false;
        },
    },

    methods: {
        async loadFromCache() {
            const { history_id, type_id } = this.item;
            const localContent = await getContentByTypeId(history_id, type_id);
            return localContent || null;
        },
        async loadFromServer() {
            const { history_id, id, history_content_type } = this.item;
            const rawServerContent = await getContentDetails({ history_id, id, history_content_type });
            this.rawData = await cacheContent(rawServerContent, true);
        },
    },

    async created() {
        this.rawData = await this.loadFromCache();
    },

    render() {
        return this.$scopedSlots.default({
            loaded: this.loaded,
            dataset: this.dataset,
            load: this.loadFromServer,
        });
    },
};
