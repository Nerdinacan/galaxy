<template>
    <component v-if="content"
        :content="content"
        class="content-item"
        :class="contentClassName"
        :is="contentItemComponent" 
        :data-state="content.state" />
</template>


<script>

import { of } from "rxjs";
import { DatasetItem } from "./Dataset";
import { DatasetCollectionItem } from "./DatasetCollection";
import dasherize from "underscore.string/dasherize";
import { getCachedContent } from "caching";

export default {
    props: {
        typeId: { type: String, required: true }
    },
    components: {
        "dataset": DatasetItem,
        "dataset_collection": DatasetCollectionItem
    },
    subscriptions() {
        return {
            content: of(this.typeId).pipe(getCachedContent())
        }
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
