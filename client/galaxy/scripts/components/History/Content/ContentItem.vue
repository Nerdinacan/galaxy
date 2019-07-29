<template>
    <component v-if="content"
        class="content-item" :data-state="content.state"
        :is="contentItemComponent"
        :content="content"
        :class="contentClassName" />
</template>


<script>

import { DatasetItem } from "../Dataset";
import { DatasetCollectionItem } from "../DatasetCollection";
import dasherize from "underscore.string/dasherize";

export default {
    props: {
        content: { type: Object, required: true }
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


<style lang="scss" scoped>

.content-item {
    outline: none;
    border-style: none;
    border-width: none;
    &.selected{
        border-style: solid;
        border-left-width: 6px;
    }
}

</style>
