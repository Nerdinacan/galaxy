<template>
    <component v-if="content" 
        :is="contentItemComponent" 
        :content="content" />
</template>

<script>

import Dataset from "./Dataset";
import DatasetCollection from "./DatasetCollection";

export default {
    props: {
        content: { type: Object, required: true }
    },
    components: {
        "dataset": Dataset,
        "dataset_collection": DatasetCollection
    },
    computed: {
        contentItemComponent() {
            return this.content.history_content_type;
        }
    }
}

</script>
