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


<!-- General styling common to all content items,
override horrible base.scss styles -->

<style lang="scss">

@import "~scss/mixins.scss";

.history-content-item.list-item {
    border: 0;

    header {

        /* stretchy headers */
        @include flexRowHeader();
        align-items: top;
        /* same height as checkbox */
        min-height: 20px;

        /* fix oppressive base.scss styling */
        /* TODO: remove !important from all base.scss */
        padding: 0 0 0 0 !important;
        a {
            display: block;
            outline: none;
        }
    }
}

</style>
