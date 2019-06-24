<template>
    <component v-if="content"
        class="history-content-item"
        :class="contentClassName"
        :is="contentItemComponent"
        :content="content"
        :index="index" />
</template>

<script>

import { Dataset, DatasetCollection } from "./Dataset";
import dasherize from "underscore.string/dasherize";

export default {
    props: {
        content: { type: Object, required: true },
        index: { type: Number, required: false, default: 0 }
    },
    components: {
        "dataset": Dataset,
        "dataset_collection": DatasetCollection
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


<!-- General styling common to all content items (if you use
scoped here this won't work, illustrating the inherent flaw
with the concept of scoped styles) -->

<style lang="scss">

@import "~scss/mixins.scss";

.history-content-item header {
    /* stretchy headers */
    @include flexRowHeader();
    /* roughly same height as checkbox */
    min-height: 20px;
}

</style>
