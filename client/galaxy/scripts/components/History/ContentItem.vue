<template>
    <component v-if="content"
        class="history-content-item"
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


<!-- General styling common to all content items -->

<style lang="scss">

@import "~scss/mixins.scss";

.history-content-item header {
    /* stretchy headers */
    @include flexRowHeader();
    align-items: baseline;
    /* roughly same height as checkbox */
    min-height: 20px;
}

</style>
