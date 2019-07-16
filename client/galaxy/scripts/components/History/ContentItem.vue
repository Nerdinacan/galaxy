<template>
    <component v-if="content"
        class="history-content-item list-item"
        :class="contentClassName"
        :is="contentItemComponent"
        :content="content" />
</template>

<script>

import { DatasetItem } from "./Dataset";
import { DatasetCollectionItem } from "./DatasetCollection";
import dasherize from "underscore.string/dasherize";

export default {
    props: {
        content: { type: Object, required: true },
    },
    components: {
        "dataset": DatasetItem,
        "dataset_collection": DatasetCollectionItem
    },
    computed: {
        contentItemComponent() {
            return this.content.history_content_type;
        },
        contentClassName() {
            return dasherize(this.content.history_content_type);
        }
    }
}

</script>
